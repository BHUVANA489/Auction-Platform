import cron from "node-cron";
import { Auction } from "../models/auctionSchema.js";
import { User } from "../models/userSchema.js";
import { Bid } from "../models/bidSchema.js";
import { sendEmail } from "../utils/sendEmail.js";
import { calculateCommission } from "../controllers/commissionController.js";
import { isDbConnected } from "../database/connection.js";

export const endedAuctionCron = () => {
  cron.schedule("*/1 * * * *", async () => {
    if (!isDbConnected()) {
      return; // Skip if database is not connected yet
    }

    try {
      const now = new Date();
      const endedAuctions = await Auction.find({
        endTime: { $lt: now },
        commissionCalculated: false,
      });

      if (endedAuctions.length === 0) {
        return;
      }

      console.log(`Cron for ended auction running... (${endedAuctions.length} auctions to process)`);

      for (const auction of endedAuctions) {
        try {
          const commissionAmount = await calculateCommission(auction._id);
          auction.commissionCalculated = true;
          const highestBidder = await Bid.findOne({
            auctionItem: auction._id,
            amount: auction.currentBid,
          });
          const auctioneer = await User.findById(auction.createdBy);
          if (!auctioneer) {
            await auction.save();
            continue;
          }

          auctioneer.unpaidCommission = (auctioneer.unpaidCommission || 0) + commissionAmount;

          if (highestBidder) {
            auction.highestBidder = highestBidder.bidder.id;
            await auction.save();
            const bidder = await User.findById(highestBidder.bidder.id);

            if (bidder) {
              await User.findByIdAndUpdate(
                bidder._id,
                {
                  $inc: {
                    moneySpent: highestBidder.amount,
                    auctionsWon: 1,
                  },
                },
                { new: true }
              );
            }

            await User.findByIdAndUpdate(
              auctioneer._id,
              {
                $inc: {
                  unpaidCommission: commissionAmount,
                },
              },
              { new: true }
            );

            if (bidder && bidder.email) {
              const subject = `Congratulations! You won the auction for ${auction.title}`;
              const bankAccountName = auctioneer.paymentMethods?.bankTransfer?.bankAccountName || "N/A";
              const bankAccountNumber = auctioneer.paymentMethods?.bankTransfer?.bankAccountNumber || "N/A";
              const bankName = auctioneer.paymentMethods?.bankTransfer?.bankName || "N/A";
              const easypaisaNumber = auctioneer.paymentMethods?.easypaisa?.easypaisaAccountNumber || "N/A";
              const paypalEmail = auctioneer.paymentMethods?.paypal?.paypalEmail || "N/A";

              const message = `Dear ${bidder.userName}, \n\nCongratulations! You have won the auction for ${auction.title}. \n\nBefore proceeding for payment contact your auctioneer via email: ${auctioneer.email} \n\nPlease complete your payment using one of the following methods:\n\n1. **Bank Transfer**: \n- Account Name: ${bankAccountName} \n- Account Number: ${bankAccountNumber} \n- Bank: ${bankName}\n\n2. **Easypaisa**:\n- Account: ${easypaisaNumber}\n\n3. **PayPal**:\n- Send payment to: ${paypalEmail}\n\n4. **Cash on Delivery (COD)**:\n- If you prefer COD, you must pay 20% upfront before delivery.\n- The remaining 80% will be paid upon delivery.\n\nThank you for participating!\n\nBest regards,\nAuction Team`;

              try {
                if (process.env.SMTP_MAIL && process.env.SMTP_PASSWORD) {
                  await sendEmail({ email: bidder.email, subject, message });
                  console.log(`✅ Notification email sent to highest bidder: ${bidder.email}`);
                }
              } catch (mailErr) {
                console.error(`⚠️ Could not send notification email: ${mailErr.message}`);
              }
            }
          } else {
            await auction.save();
          }
        } catch (error) {
          console.error("Error processing ended auction:", error.message || error);
        }
      }
    } catch (err) {
      console.error("Error in endedAuctionCron:", err.message || err);
    }
  });
};
