const expect = require("chai").expect;
const sinon = require("sinon");
const mongoose = require("mongoose");

const User = require("../models/userModel");
const AuthController = require("../controllers/authController");

describe("Auth Controller", function () {
  before(function (done) {
    mongoose
      .connect(
        "mongodb+srv://yummyfunnybunny:QDwC27IOuoNn1YTA@maximiliannodejsshop.ocmdg.mongodb.net/test-messages?retryWrites=true&w=majority"
      )
      .then((result) => {
        const user = new User({
          email: "test@test.com",
          password: "12345",
          name: "Test",
          posts: [],
          _id: "5c0f66b979af55031b34728a",
        });
        return user.save();
      })
      .then(() => {
        done();
      });
  });

  // beforeEach(function () {});
  // afterEach(function () {});

  it("should throw an error with code 500 if accessing the database fails", function (done) {
    sinon.stub(User, "findOne");
    User.findOne.throws();

    const req = {
      body: {
        email: "test@test.com",
        password: "12345",
      },
    };

    AuthController.login(req, {}, () => {}).then((result) => {
      expect(result).to.be.an("error");
      expect(result).to.have.property("statusCode", 500);
      done();
    });

    User.findOne.restore();
  });

  it("should send a response with a valid user status for an existing user", function (done) {
    const req = {
      userId: "5c0f66b979af55031b34728a",
    };
    const res = {
      statusCode: 500,
      userStatus: null,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.userStatus = data.status;
      },
    };
    AuthController.getUserStatus(req, res, () => {}).then(() => {
      expect(res.statusCode).to.be.equal(200);
      expect(res.userStatus).to.be.equal("I am new!");
      done();
    });
  });

  after(function (done) {
    User.deleteMany({})
      .then(() => {
        return mongoose.disconnect();
      })
      .then(() => {
        done();
      });
  });
});

/*
  Describes:
  - describes are mocha functions that you can use to group tests together.
  - helps keep all of your tests categorized and organized

  Async / Await Testing
  - You add the mocha function 'done' to your testing function to force it to act like an async function.


  Database Testing:
  - You DO NOT want to use your production database for testing

  lifecycle hooks:
  - provided by mocha
  - we have extra functions that we can run inside of our describes that run before ALL of our actual tests
  - we can use these hooks to initialize things (like a dummy database) that multiple tests will need in order
      to run properly
      ex. we run the 'before' function at the top of our describe to initialize the dummy DB
  - we also have the 'after' function that we can run AFTER all of our tests to perform certain actions that multiple
      tests need to run
      ex. we run 'after' to clear the dummy DB of all documents so that future tests will run successfully
  - you also have 'beforeEach' and 'afterEach' will will run before/after EACH 'it' test. these are useful for
      when you need to do some initialization and cleanup before/after every test
*/
