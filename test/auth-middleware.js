const expect = require("chai").expect;
const sinon = require("sinon");
const jwt = require("jsonwebtoken");

const authMiddleware = require("../middleware/is-auth");

describe("Auth middleware", function () {
  // LINK middleware/is-auth.js#authHeader
  it("should throw an error if no authorization header is present", function () {
    const req = {
      get: function () {
        return null;
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw("Not authenticated");
  });

  // LINK middleware/is-auth.js#tokenString
  it("should throw an error if the authorization header is only one string", function () {
    const req = {
      get: function (headerName) {
        return "xyz";
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });

  it("should throw in error if the token cannot be verified", function () {
    const req = {
      get: function (headerName) {
        return "Bearer xyz";
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });

  it("should yeild a userId after decoding the token", function () {
    const req = {
      get: function (headerName) {
        return "Bearer dfvefhrjtryjksxyrj";
      },
    };
    // this jwt.verify function is called a stub - it overrides the original function with our dummy function
    sinon.stub(jwt, "verify");
    jwt.verify.returns({ userId: "abc" });
    authMiddleware(req, {}, () => {});
    expect(req).to.have.property("userId");
    expect(req).to.have.property("userId", "abc");
    jwt.verify.restore();
  });
});

// unit test vs integration test
/*
 a unit test is a test that runs on a single component or function

 an integration test is a full test of an entire flow (like a user request to a specific endpoint including
  the response portion )

  you should NOT test external code dependencies (dont test jwt compare functions, for example)
*/
