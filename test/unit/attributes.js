import helpers from '../lib/helpers';
import skate from '../../src/skate';

describe('Attribute listeners', function () {
  it('should listen to changes in specified attributes', function (done) {
    var created = false;
    var updated = false;

    skate('div', {
      attributes: {
        open: {
          created: function (element, data) {
            created = true;
            data.newValue.should.equal('created');
            element.setAttribute('open', 'updated');
          },
          updated: function (element, data) {
            updated = true;
            data.oldValue.should.equal('created');
            data.newValue.should.equal('updated');
            element.removeAttribute('open');
          },
          removed: function (element, data) {
            created.should.equal(true);
            updated.should.equal(true);
            data.oldValue.should.equal('updated');
            done();
          }
        }
      }
    });

    helpers.fixture('<div open="created"></div>');
  });

  it('should accept a function insead of an object for a particular attribute definition.', function (done) {
    skate('div', {
      attributes: {
        open: function (element, data) {
          if (data.type === 'created') {
            element.setAttribute('open', 'updated');
          } else if (data.type === 'updated') {
            element.removeAttribute('open');
          } else if (data.type === 'removed') {
            assert(true);
            done();
          }
        }
      }
    });

    helpers.fixture('<div id="attrtest" open="created"></div>');
  });

  it('should accept a function insead of an object for the entire attribute definition.', function (done) {
    skate('div', {
      attributes: function (element, data) {
        if (data.type === 'created') {
          setTimeout(function () {
            element.setAttribute('open', 'updated');
          });
        } else if (data.type === 'updated') {
          setTimeout(function () {
            element.removeAttribute('open');
          });
        } else if (data.type === 'removed') {
          assert(true);
          done();
        }
      }
    });

    helpers.fixture('<div id="attrtest" open="created"></div>');
  });

  it('should ensure an attribute exists before trying to action it just in case another attribute handler removes it', function () {
    skate('div', {
      attributes: function (element, data) {
        if (data.name === 'first') {
          element.removeAttribute('second');
        }
      }
    });

    document.body.innerHTML = '<div first="first" second="second"></div>';
    var div = skate.init(document.body.querySelector('div'));
    div.hasAttribute('first').should.equal(true);
    div.hasAttribute('second').should.equal(false);
  });

  it('should ensure attributes are initialised', function () {
    var called = false;
    skate('my-el', {
      attributes: function (element, data) {
        called = true;
      }
    });

    skate.init(helpers.fixture('<my-el some-attr></my-el>'));
    expect(called).to.equal(true);
  });

  describe('should define properties for all watched attributes', function () {
    it('should set the attribute when the property is set', function () {

    });

    it('should set the property when the attribute is set', function () {

    });
  });
});
