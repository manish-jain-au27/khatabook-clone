const express = require('express');
const router = express.Router();
const Ledger = require('../models/ledger');
const Transaction = require('../models/transaction');
const twilio = require('twilio');

// Configure Twilio client
const twilioClient = twilio('AC92464635a1c6e46f12b5c71561397db3', 'bac822757a5031f03ce28ef62b9ec46c');

// GET /ledger
router.get('/', (req, res) => {
  Ledger.find({})
    .then((ledgers) => {
      res.render('ledger', { ledgers });
    })
    .catch((err) => {
      console.error('Error fetching ledgers:', err);
      res.status(500).send('Internal Server Error');
    });
});

// POST /ledger
router.post('/', (req, res) => {
  const { name } = req.body;

  const ledger = new Ledger({ name });

  ledger.save()
    .then(() => {
      res.redirect('/ledger');
    })
    .catch((err) => {
      console.error('Error saving ledger:', err);
      res.status(500).send('Internal Server Error');
    });
});

// GET /ledger/:ledgerId
router.get('/:ledgerId', (req, res) => {
  const { ledgerId } = req.params;

  Ledger.findById(ledgerId)
    .then((ledger) => {
      Transaction.find({ ledger: ledgerId })
        .sort({ timestamp: -1 })
        .then((transactions) => {
          const balance = calculateBalance(transactions);
          res.render('dashboard', { ledger, transactions, balance });
        })
        .catch((err) => {
          console.error('Error fetching transactions:', err);
          res.status(500).send('Internal Server Error');
        });
    })
    .catch((err) => {
      console.error('Error fetching ledger:', err);
      res.status(500).send('Internal Server Error');
    });
});

// POST /ledger/:ledgerId/transactions
router.post('/:ledgerId/transactions', (req, res) => {
  const { ledgerId } = req.params;
  const { title, amount, type, mobile } = req.body;

  const transaction = new Transaction({
    title,
    amount,
    type,
    ledger: ledgerId,
    mobile
  });

  transaction.save()
    .then(() => {
      sendSmsNotification(transaction);
      res.redirect(`/ledger/${ledgerId}`);
    })
    .catch((err) => {
      console.error('Error saving transaction:', err);
      res.status(500).send('Internal Server Error');
    });
});

// Helper function to calculate balance
function calculateBalance(transactions) {
  let balance = 0;
  for (const transaction of transactions) {
    if (transaction.type === 'credit') {
      balance += transaction.amount;
    } else if (transaction.type === 'debit') {
      balance -= transaction.amount;
    }
  }
  return balance;
}

// Helper function to send SMS notification
function sendSmsNotification(transaction) {
  const { mobile, title, amount } = transaction;

  const message = `New transaction: ${title}\nAmount: ${amount}`;
  twilioClient.messages
    .create({
      body: message,
      from: '+13612668997',
      to: mobile
    })
    .then((message) => {
      console.log('SMS sent successfully:', message.sid);
    })
    .catch((err) => {
      console.error('Error sending SMS:', err);
    });
}

module.exports = router;
