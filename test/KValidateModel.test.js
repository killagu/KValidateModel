/**
 * Created by killa on 12/23/15.
 */

'use strict';

var KValidateModel = require('../index');
var should = require('should');

describe('test validate model', function() {
  describe('test value array', function() {
    class TestModel extends KValidateModel {
      get schema() {
        return [{
          type: 'number'
        }]
      }
    }

    it('should success', function() {
      var test = new TestModel([1, 2, 3]);
    })
  });

  describe('test date', function() {
    class TestModel extends KValidateModel {
      get schema() {
        return {
          a: {
            type: 'date',
            required: true,
            code: 1
          }
        }
      }
    }

    it('should success', function() {
      var date = new Date();
      var test = new TestModel({
        a: date.toISOString()
      });
      test.a.should.be.an.instanceOf(Date);
      test.a.getTime().should.equal(date.getTime());
    })
  });

  describe('test filed named type', function() {
    class TestModel extends KValidateModel {
      get schema() {
        return {
          type: [TestModel2],
          date: {
            type: 'string'
          }
        }
      }
    }

    class TestModel2 extends KValidateModel {
      get schema() {
        return {
          date: {
            type: 'string'
          }
        }
      }
    }

    it('should success', function() {
      var test = new TestModel({
        type: [{
          date: '2'
        }],
        date: '321'
      });
    })
  });

  describe('test schema', function() {
    class TestModel extends KValidateModel {
      get schema() {
        return {
          a: {
            type: 'number',
            required: true,
            code: 1
          },
          b: {
            type: 'string',
            required: true,
            code: 2
          },
          c: {
            type: 'number',
            required: false,
            code: 3
          },
          d: {
            type: 'string',
            required: false,
            code: 4
          }
        }
      }
    }

    it('should validate', function(done) {
      var test = new TestModel({
        a: 1,
        b: 'test',
        c: 2,
        d: 'test2',
        e: 'invalidate'
      });
      test.a.should.equal(1);
      test.b.should.equal('test');
      test.c.should.equal(2);
      test.d.should.equal('test2');
      should.not.exists(test.e);
      done();
    });

    it('should validate when not required key lacked', function(done) {
      var test = new TestModel({
        a: 1,
        b: 'test',
        e: 'invalidate'
      });
      test.a.should.equal(1);
      test.b.should.equal('test');
      should.not.exists(test.e);
      done();
    });

    it('should invalidate when type is error', function(done) {
      var error;
      try {
        var test = new TestModel({
          a: 'test',
          b: 'test',
          c: 2,
          d: 'test2',
          e: 'invalidate'
        });
      } catch (e) {
        error = e;
      }
      should.exists(error);
      error.code.should.equal(1);
      done();
    });

    it('should invalidate when lack key', function(done) {
      var error;
      try {
        var test = new TestModel({
          a: 1,
          c: 2,
          d: 'test2',
          e: 'invalidate'
        });
      } catch (e) {
        error = e;
      }
      should.exists(error);
      error.code.should.equal(2);
      done();
    })
  });

  describe('test array schema', function() {
    class TestModel extends KValidateModel {
      get schema() {
        return [{
          a: {
            type: 'number',
            required: true,
            code: 1
          },
          b: {
            type: 'string',
            required: true,
            code: 2
          },
          c: {
            type: 'number',
            required: false,
            code: 3
          },
          d: {
            type: 'string',
            required: false,
            code: 4
          }
        }]
      }
    }

    it('should validate', function(done) {
      var test = new TestModel([{
        a: 1,
        b: 'test',
        c: 2,
        d: 'test2',
        e: 'invalidate'
      }, {
        a: 2,
        b: 'test2',
        c: 3
      }]);
      test[0].a.should.equal(1);
      test[0].b.should.equal('test');
      test[0].c.should.equal(2);
      test[0].d.should.equal('test2');
      test[1].a.should.equal(2);
      test[1].b.should.equal('test2');
      test[1].c.should.equal(3);
      should.not.exists(test.e);
      done();
    });

    it('should error when data is not array', function(done) {
      var error;
      try {
        var test = new TestModel({
          a: 'test',
          b: 'test',
          c: 2,
          d: 'test2',
          e: 'invalidate'
        });
      } catch (e) {
        error = e;
      }
      should.exists(error);
      done();
    });

    it('should invalidate when type is error', function(done) {
      var error;
      try {
        var test = new TestModel([{
          a: 'test',
          b: 'test',
          c: 2,
          d: 'test2',
          e: 'invalidate'
        }]);
      } catch (e) {
        error = e;
      }
      should.exists(error);
      error.code.should.equal(1);
      done();
    });

  });

  describe('test nest schema', function() {
    class TestModel extends KValidateModel {
      get schema() {
        return [{
          a: {
            type: 'number',
            required: true,
            code: 1
          },
          b: {
            type: 'string',
            required: true,
            code: 2
          },
          e: {
            f: {
              type: 'number',
              required: true,
              code: 3
            }
          }
        }]
      }
    }

    it('should validate', function(done) {
      var test = new TestModel([{
        a: 1,
        b: 'test',
        c: 2,
        d: 'test2',
        e: {
          f: 3
        }
      }, {
        a: 2,
        b: 'test2',
        e: {
          f: 4
        }
      }]);
      test[0].a.should.equal(1);
      test[0].b.should.equal('test');
      test[0].e.f.should.equal(3);
      test[1].a.should.equal(2);
      test[1].b.should.equal('test2');
      test[1].e.f.should.equal(4);
      should.not.exists(test.e);
      done();
    });

    it('should error when nest obj is wrong', function(done) {
      var error;
      try {
        var test = new TestModel([{
          a: 1,
          b: 'test',
          c: 2,
          d: 'test2',
          e: 4
        }, {
          a: 2,
          b: 'test2',
          e: {
            f: 4
          }
        }]);
      } catch (e) {
        error = e;
      }
      should.exists(error);
      error.code.should.equal(3);
      done();
    });
  })

  describe('test nest array schema', function() {
    class TestModel extends KValidateModel {
      get schema() {
        return [{
          a: {
            type: 'number',
            required: true,
            code: 1
          },
          b: {
            type: 'string',
            required: true,
            code: 2
          },
          e: [{
            f: {
              type: 'number',
              required: true,
              code: 3
            }
          }]
        }]
      }
    }

    it('should validate', function(done) {
      var test = new TestModel([{
        a: 1,
        b: 'test',
        c: 2,
        d: 'test2',
        e: [{
          f: 3
        }]
      }, {
        a: 2,
        b: 'test2',
        e: [{
          f: 4
        }]
      }]);
      test[0].a.should.equal(1);
      test[0].b.should.equal('test');
      test[0].e[0].f.should.equal(3);
      test[1].a.should.equal(2);
      test[1].b.should.equal('test2');
      test[1].e[0].f.should.equal(4);
      should.not.exists(test.e);
      done();
    });

    it('should error when nest obj is wrong', function(done) {
      var error;
      try {
        var test = new TestModel([{
          a: 1,
          b: 'test',
          c: 2,
          d: 'test2',
          e: 4
        }, {
          a: 2,
          b: 'test2',
          e: {
            f: 4
          }
        }]);
      } catch (e) {
        error = e;
      }
      should.exists(error);
      done();
    });
  });

  describe('test nest array schema', function() {
    class NestModel extends KValidateModel {
      get schema() {
        return {
          a: {
            type: 'number',
            required: true,
            code: 1
          },
          b: {
            type: 'string',
            required: true,
            code: 2
          }
        }
      }
    }

    class TestModel extends KValidateModel {
      get schema() {
        return [{
          a: {
            type: 'number',
            required: true,
            code: 1
          },
          b: {
            type: 'string',
            required: true,
            code: 2
          },
          e: [{
            f: {
              type: NestModel,
              required: true,
              code: 3
            }
          }],
          g: [NestModel]
        }]
      }
    }

    it('should validate', function(done) {
      var test = new TestModel([{
        a: 1,
        b: 'test',
        e: [{
          f: {
            a: 3,
            b: 'test'
          }
        }],
        g: [{
          a: 5,
          b: 'test2'
        }]
      }, {
        a: 2,
        b: 'test2',
        e: [{
          f: {
            a: 4,
            b: 'test'
          }
        }]
      }]);
      test[0].a.should.equal(1);
      test[0].b.should.equal('test');
      test[0].e[0].f.a.should.equal(3);
      test[0].e[0].f.b.should.equal('test');
      test[0].g[0].a.should.equal(5);
      test[0].g[0].b.should.equal('test2');

      test[1].a.should.equal(2);
      test[1].b.should.equal('test2');
      test[1].e[0].f.a.should.equal(4);
      test[1].e[0].f.b.should.equal('test');
      should.not.exists(test.e);
      done();
    });

  });

  describe('test path validate', function() {
    class NestModel extends KValidateModel {
      get schema() {
        return {
          a: {
            type: 'number',
            required: true,
            code: 1
          },
          b: {
            type: 'string',
            required: true,
            code: 2
          }
        }
      }

      get path() {
        return {
          a: function(value) {
            return value % 2 != 0;
          }
        }
      }
    }

    class TestModel extends KValidateModel {
      get schema() {
        return {
          a: {
            type: 'number',
            required: true,
            code: 1
          },
          b: {
            type: 'string',
            required: true,
            code: 2
          },
          c: {
            type: 'number',
            required: false,
            code: 3
          },
          d: {
            type: 'string',
            required: false,
            code: 4
          },
          f: {
            type: NestModel
          }
        }
      }

      get path() {
        return {
          a: function(value) {
            return value % 2 == 0;
          }
        }
      }
    }

    it('should validate', function(done) {
      var test = new TestModel({
        a: 2,
        b: 'test',
        c: 2,
        d: 'test2',
        e: 'invalidate'
      });
      test.a.should.equal(2);
      test.b.should.equal('test');
      test.c.should.equal(2);
      test.d.should.equal('test2');
      should.not.exists(test.e);
      done();
    });

    it('should invalidate when type is error', function(done) {
      var error;
      try {
        var test = new TestModel({
          a: 1,
          b: 'test',
          c: 2,
          d: 'test2',
          e: 'invalidate'
        });
      } catch (e) {
        error = e;
      }
      should.exists(error);
      error.code.should.equal(1);
      done();
    });

    it('should invalidate when nest path is error', function(done) {
      var error;
      try {
        var test = new TestModel({
          a: 2,
          b: 'test',
          c: 2,
          d: 'test2',
          e: 'invalidate',
          f: {
            a: 2,
            b: 'hello'
          }
        });
      } catch (e) {
        error = e;
      }
      should.exists(error);
      error.code.should.equal(1);
      done();
    })

  })
});
