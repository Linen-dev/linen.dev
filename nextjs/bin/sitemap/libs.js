'use strict';
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) =>
  function __require() {
    return (
      mod ||
        (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod),
      mod.exports
    );
  };
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to2, from, except, desc) => {
  if ((from && typeof from === 'object') || typeof from === 'function') {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to2, key) && key !== except)
        __defProp(to2, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to2;
};
var __toESM = (mod, isNodeMode, target) => (
  (target = mod != null ? __create(__getProtoOf(mod)) : {}),
  __copyProps(
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, 'default', { value: mod, enumerable: true })
      : target,
    mod
  )
);
var __toCommonJS = (mod) =>
  __copyProps(__defProp({}, '__esModule', { value: true }), mod);

// node_modules/xmldom/sax.js
var require_sax = __commonJS({
  'node_modules/xmldom/sax.js'(exports) {
    var nameStartChar =
      /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
    var nameChar = new RegExp(
      '[\\-\\.0-9' +
        nameStartChar.source.slice(1, -1) +
        '\\u00B7\\u0300-\\u036F\\u203F-\\u2040]'
    );
    var tagNamePattern = new RegExp(
      '^' +
        nameStartChar.source +
        nameChar.source +
        '*(?::' +
        nameStartChar.source +
        nameChar.source +
        '*)?$'
    );
    var S_TAG = 0;
    var S_ATTR = 1;
    var S_ATTR_SPACE = 2;
    var S_EQ = 3;
    var S_ATTR_NOQUOT_VALUE = 4;
    var S_ATTR_END = 5;
    var S_TAG_SPACE = 6;
    var S_TAG_CLOSE = 7;
    function XMLReader() {}
    XMLReader.prototype = {
      parse: function (source, defaultNSMap, entityMap) {
        var domBuilder = this.domBuilder;
        domBuilder.startDocument();
        _copy(defaultNSMap, (defaultNSMap = {}));
        parse(source, defaultNSMap, entityMap, domBuilder, this.errorHandler);
        domBuilder.endDocument();
      },
    };
    function parse(
      source,
      defaultNSMapCopy,
      entityMap,
      domBuilder,
      errorHandler
    ) {
      function fixedFromCharCode(code) {
        if (code > 65535) {
          code -= 65536;
          var surrogate1 = 55296 + (code >> 10),
            surrogate2 = 56320 + (code & 1023);
          return String.fromCharCode(surrogate1, surrogate2);
        } else {
          return String.fromCharCode(code);
        }
      }
      function entityReplacer(a2) {
        var k = a2.slice(1, -1);
        if (k in entityMap) {
          return entityMap[k];
        } else if (k.charAt(0) === '#') {
          return fixedFromCharCode(parseInt(k.substr(1).replace('x', '0x')));
        } else {
          errorHandler.error('entity not found:' + a2);
          return a2;
        }
      }
      function appendText(end2) {
        if (end2 > start) {
          var xt = source
            .substring(start, end2)
            .replace(/&#?\w+;/g, entityReplacer);
          locator && position(start);
          domBuilder.characters(xt, 0, end2 - start);
          start = end2;
        }
      }
      function position(p, m) {
        while (p >= lineEnd && (m = linePattern.exec(source))) {
          lineStart = m.index;
          lineEnd = lineStart + m[0].length;
          locator.lineNumber++;
        }
        locator.columnNumber = p - lineStart + 1;
      }
      var lineStart = 0;
      var lineEnd = 0;
      var linePattern = /.*(?:\r\n?|\n)|.*$/g;
      var locator = domBuilder.locator;
      var parseStack = [{ currentNSMap: defaultNSMapCopy }];
      var closeMap = {};
      var start = 0;
      while (true) {
        try {
          var tagStart = source.indexOf('<', start);
          if (tagStart < 0) {
            if (!source.substr(start).match(/^\s*$/)) {
              var doc = domBuilder.doc;
              var text = doc.createTextNode(source.substr(start));
              doc.appendChild(text);
              domBuilder.currentElement = text;
            }
            return;
          }
          if (tagStart > start) {
            appendText(tagStart);
          }
          switch (source.charAt(tagStart + 1)) {
            case '/':
              var end = source.indexOf('>', tagStart + 3);
              var tagName = source.substring(tagStart + 2, end);
              var config = parseStack.pop();
              if (end < 0) {
                tagName = source.substring(tagStart + 2).replace(/[\s<].*/, '');
                errorHandler.error(
                  'end tag name: ' +
                    tagName +
                    ' is not complete:' +
                    config.tagName
                );
                end = tagStart + 1 + tagName.length;
              } else if (tagName.match(/\s</)) {
                tagName = tagName.replace(/[\s<].*/, '');
                errorHandler.error(
                  'end tag name: ' + tagName + ' maybe not complete'
                );
                end = tagStart + 1 + tagName.length;
              }
              var localNSMap = config.localNSMap;
              var endMatch = config.tagName == tagName;
              var endIgnoreCaseMach =
                endMatch ||
                (config.tagName &&
                  config.tagName.toLowerCase() == tagName.toLowerCase());
              if (endIgnoreCaseMach) {
                domBuilder.endElement(config.uri, config.localName, tagName);
                if (localNSMap) {
                  for (var prefix in localNSMap) {
                    domBuilder.endPrefixMapping(prefix);
                  }
                }
                if (!endMatch) {
                  errorHandler.fatalError(
                    'end tag name: ' +
                      tagName +
                      ' is not match the current start tagName:' +
                      config.tagName
                  );
                }
              } else {
                parseStack.push(config);
              }
              end++;
              break;
            case '?':
              locator && position(tagStart);
              end = parseInstruction(source, tagStart, domBuilder);
              break;
            case '!':
              locator && position(tagStart);
              end = parseDCC(source, tagStart, domBuilder, errorHandler);
              break;
            default:
              locator && position(tagStart);
              var el = new ElementAttributes();
              var currentNSMap = parseStack[parseStack.length - 1].currentNSMap;
              var end = parseElementStartPart(
                source,
                tagStart,
                el,
                currentNSMap,
                entityReplacer,
                errorHandler
              );
              var len = el.length;
              if (
                !el.closed &&
                fixSelfClosed(source, end, el.tagName, closeMap)
              ) {
                el.closed = true;
                if (!entityMap.nbsp) {
                  errorHandler.warning('unclosed xml attribute');
                }
              }
              if (locator && len) {
                var locator2 = copyLocator(locator, {});
                for (var i = 0; i < len; i++) {
                  var a = el[i];
                  position(a.offset);
                  a.locator = copyLocator(locator, {});
                }
                domBuilder.locator = locator2;
                if (appendElement(el, domBuilder, currentNSMap)) {
                  parseStack.push(el);
                }
                domBuilder.locator = locator;
              } else {
                if (appendElement(el, domBuilder, currentNSMap)) {
                  parseStack.push(el);
                }
              }
              if (el.uri === 'http://www.w3.org/1999/xhtml' && !el.closed) {
                end = parseHtmlSpecialContent(
                  source,
                  end,
                  el.tagName,
                  entityReplacer,
                  domBuilder
                );
              } else {
                end++;
              }
          }
        } catch (e) {
          errorHandler.error('element parse error: ' + e);
          end = -1;
        }
        if (end > start) {
          start = end;
        } else {
          appendText(Math.max(tagStart, start) + 1);
        }
      }
    }
    function copyLocator(f, t) {
      t.lineNumber = f.lineNumber;
      t.columnNumber = f.columnNumber;
      return t;
    }
    function parseElementStartPart(
      source,
      start,
      el,
      currentNSMap,
      entityReplacer,
      errorHandler
    ) {
      var attrName;
      var value;
      var p = ++start;
      var s = S_TAG;
      while (true) {
        var c = source.charAt(p);
        switch (c) {
          case '=':
            if (s === S_ATTR) {
              attrName = source.slice(start, p);
              s = S_EQ;
            } else if (s === S_ATTR_SPACE) {
              s = S_EQ;
            } else {
              throw new Error('attribute equal must after attrName');
            }
            break;
          case "'":
          case '"':
            if (s === S_EQ || s === S_ATTR) {
              if (s === S_ATTR) {
                errorHandler.warning('attribute value must after "="');
                attrName = source.slice(start, p);
              }
              start = p + 1;
              p = source.indexOf(c, start);
              if (p > 0) {
                value = source
                  .slice(start, p)
                  .replace(/&#?\w+;/g, entityReplacer);
                el.add(attrName, value, start - 1);
                s = S_ATTR_END;
              } else {
                throw new Error("attribute value no end '" + c + "' match");
              }
            } else if (s == S_ATTR_NOQUOT_VALUE) {
              value = source
                .slice(start, p)
                .replace(/&#?\w+;/g, entityReplacer);
              el.add(attrName, value, start);
              errorHandler.warning(
                'attribute "' + attrName + '" missed start quot(' + c + ')!!'
              );
              start = p + 1;
              s = S_ATTR_END;
            } else {
              throw new Error('attribute value must after "="');
            }
            break;
          case '/':
            switch (s) {
              case S_TAG:
                el.setTagName(source.slice(start, p));
              case S_ATTR_END:
              case S_TAG_SPACE:
              case S_TAG_CLOSE:
                s = S_TAG_CLOSE;
                el.closed = true;
              case S_ATTR_NOQUOT_VALUE:
              case S_ATTR:
              case S_ATTR_SPACE:
                break;
              default:
                throw new Error("attribute invalid close char('/')");
            }
            break;
          case '':
            errorHandler.error('unexpected end of input');
            if (s == S_TAG) {
              el.setTagName(source.slice(start, p));
            }
            return p;
          case '>':
            switch (s) {
              case S_TAG:
                el.setTagName(source.slice(start, p));
              case S_ATTR_END:
              case S_TAG_SPACE:
              case S_TAG_CLOSE:
                break;
              case S_ATTR_NOQUOT_VALUE:
              case S_ATTR:
                value = source.slice(start, p);
                if (value.slice(-1) === '/') {
                  el.closed = true;
                  value = value.slice(0, -1);
                }
              case S_ATTR_SPACE:
                if (s === S_ATTR_SPACE) {
                  value = attrName;
                }
                if (s == S_ATTR_NOQUOT_VALUE) {
                  errorHandler.warning(
                    'attribute "' + value + '" missed quot(")!!'
                  );
                  el.add(
                    attrName,
                    value.replace(/&#?\w+;/g, entityReplacer),
                    start
                  );
                } else {
                  if (
                    currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' ||
                    !value.match(/^(?:disabled|checked|selected)$/i)
                  ) {
                    errorHandler.warning(
                      'attribute "' +
                        value +
                        '" missed value!! "' +
                        value +
                        '" instead!!'
                    );
                  }
                  el.add(value, value, start);
                }
                break;
              case S_EQ:
                throw new Error('attribute value missed!!');
            }
            return p;
          case '\x80':
            c = ' ';
          default:
            if (c <= ' ') {
              switch (s) {
                case S_TAG:
                  el.setTagName(source.slice(start, p));
                  s = S_TAG_SPACE;
                  break;
                case S_ATTR:
                  attrName = source.slice(start, p);
                  s = S_ATTR_SPACE;
                  break;
                case S_ATTR_NOQUOT_VALUE:
                  var value = source
                    .slice(start, p)
                    .replace(/&#?\w+;/g, entityReplacer);
                  errorHandler.warning(
                    'attribute "' + value + '" missed quot(")!!'
                  );
                  el.add(attrName, value, start);
                case S_ATTR_END:
                  s = S_TAG_SPACE;
                  break;
              }
            } else {
              switch (s) {
                case S_ATTR_SPACE:
                  var tagName = el.tagName;
                  if (
                    currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' ||
                    !attrName.match(/^(?:disabled|checked|selected)$/i)
                  ) {
                    errorHandler.warning(
                      'attribute "' +
                        attrName +
                        '" missed value!! "' +
                        attrName +
                        '" instead2!!'
                    );
                  }
                  el.add(attrName, attrName, start);
                  start = p;
                  s = S_ATTR;
                  break;
                case S_ATTR_END:
                  errorHandler.warning(
                    'attribute space is required"' + attrName + '"!!'
                  );
                case S_TAG_SPACE:
                  s = S_ATTR;
                  start = p;
                  break;
                case S_EQ:
                  s = S_ATTR_NOQUOT_VALUE;
                  start = p;
                  break;
                case S_TAG_CLOSE:
                  throw new Error(
                    "elements closed character '/' and '>' must be connected to"
                  );
              }
            }
        }
        p++;
      }
    }
    function appendElement(el, domBuilder, currentNSMap) {
      var tagName = el.tagName;
      var localNSMap = null;
      var i = el.length;
      while (i--) {
        var a = el[i];
        var qName = a.qName;
        var value = a.value;
        var nsp = qName.indexOf(':');
        if (nsp > 0) {
          var prefix = (a.prefix = qName.slice(0, nsp));
          var localName = qName.slice(nsp + 1);
          var nsPrefix = prefix === 'xmlns' && localName;
        } else {
          localName = qName;
          prefix = null;
          nsPrefix = qName === 'xmlns' && '';
        }
        a.localName = localName;
        if (nsPrefix !== false) {
          if (localNSMap == null) {
            localNSMap = {};
            _copy(currentNSMap, (currentNSMap = {}));
          }
          currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
          a.uri = 'http://www.w3.org/2000/xmlns/';
          domBuilder.startPrefixMapping(nsPrefix, value);
        }
      }
      var i = el.length;
      while (i--) {
        a = el[i];
        var prefix = a.prefix;
        if (prefix) {
          if (prefix === 'xml') {
            a.uri = 'http://www.w3.org/XML/1998/namespace';
          }
          if (prefix !== 'xmlns') {
            a.uri = currentNSMap[prefix || ''];
          }
        }
      }
      var nsp = tagName.indexOf(':');
      if (nsp > 0) {
        prefix = el.prefix = tagName.slice(0, nsp);
        localName = el.localName = tagName.slice(nsp + 1);
      } else {
        prefix = null;
        localName = el.localName = tagName;
      }
      var ns = (el.uri = currentNSMap[prefix || '']);
      domBuilder.startElement(ns, localName, tagName, el);
      if (el.closed) {
        domBuilder.endElement(ns, localName, tagName);
        if (localNSMap) {
          for (prefix in localNSMap) {
            domBuilder.endPrefixMapping(prefix);
          }
        }
      } else {
        el.currentNSMap = currentNSMap;
        el.localNSMap = localNSMap;
        return true;
      }
    }
    function parseHtmlSpecialContent(
      source,
      elStartEnd,
      tagName,
      entityReplacer,
      domBuilder
    ) {
      if (/^(?:script|textarea)$/i.test(tagName)) {
        var elEndStart = source.indexOf('</' + tagName + '>', elStartEnd);
        var text = source.substring(elStartEnd + 1, elEndStart);
        if (/[&<]/.test(text)) {
          if (/^script$/i.test(tagName)) {
            domBuilder.characters(text, 0, text.length);
            return elEndStart;
          }
          text = text.replace(/&#?\w+;/g, entityReplacer);
          domBuilder.characters(text, 0, text.length);
          return elEndStart;
        }
      }
      return elStartEnd + 1;
    }
    function fixSelfClosed(source, elStartEnd, tagName, closeMap) {
      var pos = closeMap[tagName];
      if (pos == null) {
        pos = source.lastIndexOf('</' + tagName + '>');
        if (pos < elStartEnd) {
          pos = source.lastIndexOf('</' + tagName);
        }
        closeMap[tagName] = pos;
      }
      return pos < elStartEnd;
    }
    function _copy(source, target) {
      for (var n in source) {
        target[n] = source[n];
      }
    }
    function parseDCC(source, start, domBuilder, errorHandler) {
      var next = source.charAt(start + 2);
      switch (next) {
        case '-':
          if (source.charAt(start + 3) === '-') {
            var end = source.indexOf('-->', start + 4);
            if (end > start) {
              domBuilder.comment(source, start + 4, end - start - 4);
              return end + 3;
            } else {
              errorHandler.error('Unclosed comment');
              return -1;
            }
          } else {
            return -1;
          }
        default:
          if (source.substr(start + 3, 6) == 'CDATA[') {
            var end = source.indexOf(']]>', start + 9);
            domBuilder.startCDATA();
            domBuilder.characters(source, start + 9, end - start - 9);
            domBuilder.endCDATA();
            return end + 3;
          }
          var matchs = split(source, start);
          var len = matchs.length;
          if (len > 1 && /!doctype/i.test(matchs[0][0])) {
            var name = matchs[1][0];
            var pubid =
              len > 3 && /^public$/i.test(matchs[2][0]) && matchs[3][0];
            var sysid = len > 4 && matchs[4][0];
            var lastMatch = matchs[len - 1];
            domBuilder.startDTD(
              name,
              pubid && pubid.replace(/^(['"])(.*?)\1$/, '$2'),
              sysid && sysid.replace(/^(['"])(.*?)\1$/, '$2')
            );
            domBuilder.endDTD();
            return lastMatch.index + lastMatch[0].length;
          }
      }
      return -1;
    }
    function parseInstruction(source, start, domBuilder) {
      var end = source.indexOf('?>', start);
      if (end) {
        var match = source
          .substring(start, end)
          .match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
        if (match) {
          var len = match[0].length;
          domBuilder.processingInstruction(match[1], match[2]);
          return end + 2;
        } else {
          return -1;
        }
      }
      return -1;
    }
    function ElementAttributes(source) {}
    ElementAttributes.prototype = {
      setTagName: function (tagName) {
        if (!tagNamePattern.test(tagName)) {
          throw new Error('invalid tagName:' + tagName);
        }
        this.tagName = tagName;
      },
      add: function (qName, value, offset) {
        if (!tagNamePattern.test(qName)) {
          throw new Error('invalid attribute:' + qName);
        }
        this[this.length++] = { qName, value, offset };
      },
      length: 0,
      getLocalName: function (i) {
        return this[i].localName;
      },
      getLocator: function (i) {
        return this[i].locator;
      },
      getQName: function (i) {
        return this[i].qName;
      },
      getURI: function (i) {
        return this[i].uri;
      },
      getValue: function (i) {
        return this[i].value;
      },
    };
    function _set_proto_(thiz, parent) {
      thiz.__proto__ = parent;
      return thiz;
    }
    if (!(_set_proto_({}, _set_proto_.prototype) instanceof _set_proto_)) {
      _set_proto_ = function (thiz, parent) {
        function p() {}
        p.prototype = parent;
        p = new p();
        for (parent in thiz) {
          p[parent] = thiz[parent];
        }
        return p;
      };
    }
    function split(source, start) {
      var match;
      var buf = [];
      var reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
      reg.lastIndex = start;
      reg.exec(source);
      while ((match = reg.exec(source))) {
        buf.push(match);
        if (match[1]) return buf;
      }
    }
    exports.XMLReader = XMLReader;
  },
});

// node_modules/xmldom/dom.js
var require_dom = __commonJS({
  'node_modules/xmldom/dom.js'(exports) {
    function copy(src, dest) {
      for (var p in src) {
        dest[p] = src[p];
      }
    }
    function _extends(Class, Super) {
      var pt = Class.prototype;
      if (Object.create) {
        var ppt = Object.create(Super.prototype);
        pt.__proto__ = ppt;
      }
      if (!(pt instanceof Super)) {
        let t2 = function () {};
        var t = t2;
        t2.prototype = Super.prototype;
        t2 = new t2();
        copy(pt, t2);
        Class.prototype = pt = t2;
      }
      if (pt.constructor != Class) {
        if (typeof Class != 'function') {
          console.error('unknow Class:' + Class);
        }
        pt.constructor = Class;
      }
    }
    var htmlns = 'http://www.w3.org/1999/xhtml';
    var NodeType = {};
    var ELEMENT_NODE = (NodeType.ELEMENT_NODE = 1);
    var ATTRIBUTE_NODE = (NodeType.ATTRIBUTE_NODE = 2);
    var TEXT_NODE = (NodeType.TEXT_NODE = 3);
    var CDATA_SECTION_NODE = (NodeType.CDATA_SECTION_NODE = 4);
    var ENTITY_REFERENCE_NODE = (NodeType.ENTITY_REFERENCE_NODE = 5);
    var ENTITY_NODE = (NodeType.ENTITY_NODE = 6);
    var PROCESSING_INSTRUCTION_NODE =
      (NodeType.PROCESSING_INSTRUCTION_NODE = 7);
    var COMMENT_NODE = (NodeType.COMMENT_NODE = 8);
    var DOCUMENT_NODE = (NodeType.DOCUMENT_NODE = 9);
    var DOCUMENT_TYPE_NODE = (NodeType.DOCUMENT_TYPE_NODE = 10);
    var DOCUMENT_FRAGMENT_NODE = (NodeType.DOCUMENT_FRAGMENT_NODE = 11);
    var NOTATION_NODE = (NodeType.NOTATION_NODE = 12);
    var ExceptionCode = {};
    var ExceptionMessage = {};
    var INDEX_SIZE_ERR = (ExceptionCode.INDEX_SIZE_ERR =
      ((ExceptionMessage[1] = 'Index size error'), 1));
    var DOMSTRING_SIZE_ERR = (ExceptionCode.DOMSTRING_SIZE_ERR =
      ((ExceptionMessage[2] = 'DOMString size error'), 2));
    var HIERARCHY_REQUEST_ERR = (ExceptionCode.HIERARCHY_REQUEST_ERR =
      ((ExceptionMessage[3] = 'Hierarchy request error'), 3));
    var WRONG_DOCUMENT_ERR = (ExceptionCode.WRONG_DOCUMENT_ERR =
      ((ExceptionMessage[4] = 'Wrong document'), 4));
    var INVALID_CHARACTER_ERR = (ExceptionCode.INVALID_CHARACTER_ERR =
      ((ExceptionMessage[5] = 'Invalid character'), 5));
    var NO_DATA_ALLOWED_ERR = (ExceptionCode.NO_DATA_ALLOWED_ERR =
      ((ExceptionMessage[6] = 'No data allowed'), 6));
    var NO_MODIFICATION_ALLOWED_ERR =
      (ExceptionCode.NO_MODIFICATION_ALLOWED_ERR =
        ((ExceptionMessage[7] = 'No modification allowed'), 7));
    var NOT_FOUND_ERR = (ExceptionCode.NOT_FOUND_ERR =
      ((ExceptionMessage[8] = 'Not found'), 8));
    var NOT_SUPPORTED_ERR = (ExceptionCode.NOT_SUPPORTED_ERR =
      ((ExceptionMessage[9] = 'Not supported'), 9));
    var INUSE_ATTRIBUTE_ERR = (ExceptionCode.INUSE_ATTRIBUTE_ERR =
      ((ExceptionMessage[10] = 'Attribute in use'), 10));
    var INVALID_STATE_ERR = (ExceptionCode.INVALID_STATE_ERR =
      ((ExceptionMessage[11] = 'Invalid state'), 11));
    var SYNTAX_ERR = (ExceptionCode.SYNTAX_ERR =
      ((ExceptionMessage[12] = 'Syntax error'), 12));
    var INVALID_MODIFICATION_ERR = (ExceptionCode.INVALID_MODIFICATION_ERR =
      ((ExceptionMessage[13] = 'Invalid modification'), 13));
    var NAMESPACE_ERR = (ExceptionCode.NAMESPACE_ERR =
      ((ExceptionMessage[14] = 'Invalid namespace'), 14));
    var INVALID_ACCESS_ERR = (ExceptionCode.INVALID_ACCESS_ERR =
      ((ExceptionMessage[15] = 'Invalid access'), 15));
    function DOMException(code, message) {
      if (message instanceof Error) {
        var error = message;
      } else {
        error = this;
        Error.call(this, ExceptionMessage[code]);
        this.message = ExceptionMessage[code];
        if (Error.captureStackTrace)
          Error.captureStackTrace(this, DOMException);
      }
      error.code = code;
      if (message) this.message = this.message + ': ' + message;
      return error;
    }
    DOMException.prototype = Error.prototype;
    copy(ExceptionCode, DOMException);
    function NodeList() {}
    NodeList.prototype = {
      length: 0,
      item: function (index) {
        return this[index] || null;
      },
      toString: function (isHTML, nodeFilter) {
        for (var buf = [], i = 0; i < this.length; i++) {
          serializeToString(this[i], buf, isHTML, nodeFilter);
        }
        return buf.join('');
      },
    };
    function LiveNodeList(node, refresh) {
      this._node = node;
      this._refresh = refresh;
      _updateLiveList(this);
    }
    function _updateLiveList(list) {
      var inc = list._node._inc || list._node.ownerDocument._inc;
      if (list._inc != inc) {
        var ls = list._refresh(list._node);
        __set__(list, 'length', ls.length);
        copy(ls, list);
        list._inc = inc;
      }
    }
    LiveNodeList.prototype.item = function (i) {
      _updateLiveList(this);
      return this[i];
    };
    _extends(LiveNodeList, NodeList);
    function NamedNodeMap() {}
    function _findNodeIndex(list, node) {
      var i = list.length;
      while (i--) {
        if (list[i] === node) {
          return i;
        }
      }
    }
    function _addNamedNode(el, list, newAttr, oldAttr) {
      if (oldAttr) {
        list[_findNodeIndex(list, oldAttr)] = newAttr;
      } else {
        list[list.length++] = newAttr;
      }
      if (el) {
        newAttr.ownerElement = el;
        var doc = el.ownerDocument;
        if (doc) {
          oldAttr && _onRemoveAttribute(doc, el, oldAttr);
          _onAddAttribute(doc, el, newAttr);
        }
      }
    }
    function _removeNamedNode(el, list, attr) {
      var i = _findNodeIndex(list, attr);
      if (i >= 0) {
        var lastIndex = list.length - 1;
        while (i < lastIndex) {
          list[i] = list[++i];
        }
        list.length = lastIndex;
        if (el) {
          var doc = el.ownerDocument;
          if (doc) {
            _onRemoveAttribute(doc, el, attr);
            attr.ownerElement = null;
          }
        }
      } else {
        throw DOMException(NOT_FOUND_ERR, new Error(el.tagName + '@' + attr));
      }
    }
    NamedNodeMap.prototype = {
      length: 0,
      item: NodeList.prototype.item,
      getNamedItem: function (key) {
        var i = this.length;
        while (i--) {
          var attr = this[i];
          if (attr.nodeName == key) {
            return attr;
          }
        }
      },
      setNamedItem: function (attr) {
        var el = attr.ownerElement;
        if (el && el != this._ownerElement) {
          throw new DOMException(INUSE_ATTRIBUTE_ERR);
        }
        var oldAttr = this.getNamedItem(attr.nodeName);
        _addNamedNode(this._ownerElement, this, attr, oldAttr);
        return oldAttr;
      },
      setNamedItemNS: function (attr) {
        var el = attr.ownerElement,
          oldAttr;
        if (el && el != this._ownerElement) {
          throw new DOMException(INUSE_ATTRIBUTE_ERR);
        }
        oldAttr = this.getNamedItemNS(attr.namespaceURI, attr.localName);
        _addNamedNode(this._ownerElement, this, attr, oldAttr);
        return oldAttr;
      },
      removeNamedItem: function (key) {
        var attr = this.getNamedItem(key);
        _removeNamedNode(this._ownerElement, this, attr);
        return attr;
      },
      removeNamedItemNS: function (namespaceURI, localName) {
        var attr = this.getNamedItemNS(namespaceURI, localName);
        _removeNamedNode(this._ownerElement, this, attr);
        return attr;
      },
      getNamedItemNS: function (namespaceURI, localName) {
        var i = this.length;
        while (i--) {
          var node = this[i];
          if (
            node.localName == localName &&
            node.namespaceURI == namespaceURI
          ) {
            return node;
          }
        }
        return null;
      },
    };
    function DOMImplementation(features) {
      this._features = {};
      if (features) {
        for (var feature in features) {
          this._features = features[feature];
        }
      }
    }
    DOMImplementation.prototype = {
      hasFeature: function (feature, version) {
        var versions = this._features[feature.toLowerCase()];
        if (versions && (!version || version in versions)) {
          return true;
        } else {
          return false;
        }
      },
      createDocument: function (namespaceURI, qualifiedName, doctype) {
        var doc = new Document();
        doc.implementation = this;
        doc.childNodes = new NodeList();
        doc.doctype = doctype;
        if (doctype) {
          doc.appendChild(doctype);
        }
        if (qualifiedName) {
          var root = doc.createElementNS(namespaceURI, qualifiedName);
          doc.appendChild(root);
        }
        return doc;
      },
      createDocumentType: function (qualifiedName, publicId, systemId) {
        var node = new DocumentType();
        node.name = qualifiedName;
        node.nodeName = qualifiedName;
        node.publicId = publicId;
        node.systemId = systemId;
        return node;
      },
    };
    function Node() {}
    Node.prototype = {
      firstChild: null,
      lastChild: null,
      previousSibling: null,
      nextSibling: null,
      attributes: null,
      parentNode: null,
      childNodes: null,
      ownerDocument: null,
      nodeValue: null,
      namespaceURI: null,
      prefix: null,
      localName: null,
      insertBefore: function (newChild, refChild) {
        return _insertBefore(this, newChild, refChild);
      },
      replaceChild: function (newChild, oldChild) {
        this.insertBefore(newChild, oldChild);
        if (oldChild) {
          this.removeChild(oldChild);
        }
      },
      removeChild: function (oldChild) {
        return _removeChild(this, oldChild);
      },
      appendChild: function (newChild) {
        return this.insertBefore(newChild, null);
      },
      hasChildNodes: function () {
        return this.firstChild != null;
      },
      cloneNode: function (deep) {
        return cloneNode(this.ownerDocument || this, this, deep);
      },
      normalize: function () {
        var child = this.firstChild;
        while (child) {
          var next = child.nextSibling;
          if (
            next &&
            next.nodeType == TEXT_NODE &&
            child.nodeType == TEXT_NODE
          ) {
            this.removeChild(next);
            child.appendData(next.data);
          } else {
            child.normalize();
            child = next;
          }
        }
      },
      isSupported: function (feature, version) {
        return this.ownerDocument.implementation.hasFeature(feature, version);
      },
      hasAttributes: function () {
        return this.attributes.length > 0;
      },
      lookupPrefix: function (namespaceURI) {
        var el = this;
        while (el) {
          var map = el._nsMap;
          if (map) {
            for (var n in map) {
              if (map[n] == namespaceURI) {
                return n;
              }
            }
          }
          el = el.nodeType == ATTRIBUTE_NODE ? el.ownerDocument : el.parentNode;
        }
        return null;
      },
      lookupNamespaceURI: function (prefix) {
        var el = this;
        while (el) {
          var map = el._nsMap;
          if (map) {
            if (prefix in map) {
              return map[prefix];
            }
          }
          el = el.nodeType == ATTRIBUTE_NODE ? el.ownerDocument : el.parentNode;
        }
        return null;
      },
      isDefaultNamespace: function (namespaceURI) {
        var prefix = this.lookupPrefix(namespaceURI);
        return prefix == null;
      },
    };
    function _xmlEncoder(c) {
      return (
        (c == '<' && '&lt;') ||
        (c == '>' && '&gt;') ||
        (c == '&' && '&amp;') ||
        (c == '"' && '&quot;') ||
        '&#' + c.charCodeAt() + ';'
      );
    }
    copy(NodeType, Node);
    copy(NodeType, Node.prototype);
    function _visitNode(node, callback) {
      if (callback(node)) {
        return true;
      }
      if ((node = node.firstChild)) {
        do {
          if (_visitNode(node, callback)) {
            return true;
          }
        } while ((node = node.nextSibling));
      }
    }
    function Document() {}
    function _onAddAttribute(doc, el, newAttr) {
      doc && doc._inc++;
      var ns = newAttr.namespaceURI;
      if (ns == 'http://www.w3.org/2000/xmlns/') {
        el._nsMap[newAttr.prefix ? newAttr.localName : ''] = newAttr.value;
      }
    }
    function _onRemoveAttribute(doc, el, newAttr, remove) {
      doc && doc._inc++;
      var ns = newAttr.namespaceURI;
      if (ns == 'http://www.w3.org/2000/xmlns/') {
        delete el._nsMap[newAttr.prefix ? newAttr.localName : ''];
      }
    }
    function _onUpdateChild(doc, el, newChild) {
      if (doc && doc._inc) {
        doc._inc++;
        var cs = el.childNodes;
        if (newChild) {
          cs[cs.length++] = newChild;
        } else {
          var child = el.firstChild;
          var i = 0;
          while (child) {
            cs[i++] = child;
            child = child.nextSibling;
          }
          cs.length = i;
        }
      }
    }
    function _removeChild(parentNode, child) {
      var previous = child.previousSibling;
      var next = child.nextSibling;
      if (previous) {
        previous.nextSibling = next;
      } else {
        parentNode.firstChild = next;
      }
      if (next) {
        next.previousSibling = previous;
      } else {
        parentNode.lastChild = previous;
      }
      _onUpdateChild(parentNode.ownerDocument, parentNode);
      return child;
    }
    function _insertBefore(parentNode, newChild, nextChild) {
      var cp = newChild.parentNode;
      if (cp) {
        cp.removeChild(newChild);
      }
      if (newChild.nodeType === DOCUMENT_FRAGMENT_NODE) {
        var newFirst = newChild.firstChild;
        if (newFirst == null) {
          return newChild;
        }
        var newLast = newChild.lastChild;
      } else {
        newFirst = newLast = newChild;
      }
      var pre = nextChild ? nextChild.previousSibling : parentNode.lastChild;
      newFirst.previousSibling = pre;
      newLast.nextSibling = nextChild;
      if (pre) {
        pre.nextSibling = newFirst;
      } else {
        parentNode.firstChild = newFirst;
      }
      if (nextChild == null) {
        parentNode.lastChild = newLast;
      } else {
        nextChild.previousSibling = newLast;
      }
      do {
        newFirst.parentNode = parentNode;
      } while (newFirst !== newLast && (newFirst = newFirst.nextSibling));
      _onUpdateChild(parentNode.ownerDocument || parentNode, parentNode);
      if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
        newChild.firstChild = newChild.lastChild = null;
      }
      return newChild;
    }
    function _appendSingleChild(parentNode, newChild) {
      var cp = newChild.parentNode;
      if (cp) {
        var pre = parentNode.lastChild;
        cp.removeChild(newChild);
        var pre = parentNode.lastChild;
      }
      var pre = parentNode.lastChild;
      newChild.parentNode = parentNode;
      newChild.previousSibling = pre;
      newChild.nextSibling = null;
      if (pre) {
        pre.nextSibling = newChild;
      } else {
        parentNode.firstChild = newChild;
      }
      parentNode.lastChild = newChild;
      _onUpdateChild(parentNode.ownerDocument, parentNode, newChild);
      return newChild;
    }
    Document.prototype = {
      nodeName: '#document',
      nodeType: DOCUMENT_NODE,
      doctype: null,
      documentElement: null,
      _inc: 1,
      insertBefore: function (newChild, refChild) {
        if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
          var child = newChild.firstChild;
          while (child) {
            var next = child.nextSibling;
            this.insertBefore(child, refChild);
            child = next;
          }
          return newChild;
        }
        if (this.documentElement == null && newChild.nodeType == ELEMENT_NODE) {
          this.documentElement = newChild;
        }
        return (
          _insertBefore(this, newChild, refChild),
          (newChild.ownerDocument = this),
          newChild
        );
      },
      removeChild: function (oldChild) {
        if (this.documentElement == oldChild) {
          this.documentElement = null;
        }
        return _removeChild(this, oldChild);
      },
      importNode: function (importedNode, deep) {
        return importNode(this, importedNode, deep);
      },
      getElementById: function (id) {
        var rtv = null;
        _visitNode(this.documentElement, function (node) {
          if (node.nodeType == ELEMENT_NODE) {
            if (node.getAttribute('id') == id) {
              rtv = node;
              return true;
            }
          }
        });
        return rtv;
      },
      createElement: function (tagName) {
        var node = new Element();
        node.ownerDocument = this;
        node.nodeName = tagName;
        node.tagName = tagName;
        node.childNodes = new NodeList();
        var attrs = (node.attributes = new NamedNodeMap());
        attrs._ownerElement = node;
        return node;
      },
      createDocumentFragment: function () {
        var node = new DocumentFragment();
        node.ownerDocument = this;
        node.childNodes = new NodeList();
        return node;
      },
      createTextNode: function (data) {
        var node = new Text();
        node.ownerDocument = this;
        node.appendData(data);
        return node;
      },
      createComment: function (data) {
        var node = new Comment();
        node.ownerDocument = this;
        node.appendData(data);
        return node;
      },
      createCDATASection: function (data) {
        var node = new CDATASection();
        node.ownerDocument = this;
        node.appendData(data);
        return node;
      },
      createProcessingInstruction: function (target, data) {
        var node = new ProcessingInstruction();
        node.ownerDocument = this;
        node.tagName = node.target = target;
        node.nodeValue = node.data = data;
        return node;
      },
      createAttribute: function (name) {
        var node = new Attr();
        node.ownerDocument = this;
        node.name = name;
        node.nodeName = name;
        node.localName = name;
        node.specified = true;
        return node;
      },
      createEntityReference: function (name) {
        var node = new EntityReference();
        node.ownerDocument = this;
        node.nodeName = name;
        return node;
      },
      createElementNS: function (namespaceURI, qualifiedName) {
        var node = new Element();
        var pl = qualifiedName.split(':');
        var attrs = (node.attributes = new NamedNodeMap());
        node.childNodes = new NodeList();
        node.ownerDocument = this;
        node.nodeName = qualifiedName;
        node.tagName = qualifiedName;
        node.namespaceURI = namespaceURI;
        if (pl.length == 2) {
          node.prefix = pl[0];
          node.localName = pl[1];
        } else {
          node.localName = qualifiedName;
        }
        attrs._ownerElement = node;
        return node;
      },
      createAttributeNS: function (namespaceURI, qualifiedName) {
        var node = new Attr();
        var pl = qualifiedName.split(':');
        node.ownerDocument = this;
        node.nodeName = qualifiedName;
        node.name = qualifiedName;
        node.namespaceURI = namespaceURI;
        node.specified = true;
        if (pl.length == 2) {
          node.prefix = pl[0];
          node.localName = pl[1];
        } else {
          node.localName = qualifiedName;
        }
        return node;
      },
    };
    _extends(Document, Node);
    function Element() {
      this._nsMap = {};
    }
    Element.prototype = {
      nodeType: ELEMENT_NODE,
      hasAttribute: function (name) {
        return this.getAttributeNode(name) != null;
      },
      getAttribute: function (name) {
        var attr = this.getAttributeNode(name);
        return (attr && attr.value) || '';
      },
      getAttributeNode: function (name) {
        return this.attributes.getNamedItem(name);
      },
      setAttribute: function (name, value) {
        var attr = this.ownerDocument.createAttribute(name);
        attr.value = attr.nodeValue = '' + value;
        this.setAttributeNode(attr);
      },
      removeAttribute: function (name) {
        var attr = this.getAttributeNode(name);
        attr && this.removeAttributeNode(attr);
      },
      appendChild: function (newChild) {
        if (newChild.nodeType === DOCUMENT_FRAGMENT_NODE) {
          return this.insertBefore(newChild, null);
        } else {
          return _appendSingleChild(this, newChild);
        }
      },
      setAttributeNode: function (newAttr) {
        return this.attributes.setNamedItem(newAttr);
      },
      setAttributeNodeNS: function (newAttr) {
        return this.attributes.setNamedItemNS(newAttr);
      },
      removeAttributeNode: function (oldAttr) {
        return this.attributes.removeNamedItem(oldAttr.nodeName);
      },
      removeAttributeNS: function (namespaceURI, localName) {
        var old = this.getAttributeNodeNS(namespaceURI, localName);
        old && this.removeAttributeNode(old);
      },
      hasAttributeNS: function (namespaceURI, localName) {
        return this.getAttributeNodeNS(namespaceURI, localName) != null;
      },
      getAttributeNS: function (namespaceURI, localName) {
        var attr = this.getAttributeNodeNS(namespaceURI, localName);
        return (attr && attr.value) || '';
      },
      setAttributeNS: function (namespaceURI, qualifiedName, value) {
        var attr = this.ownerDocument.createAttributeNS(
          namespaceURI,
          qualifiedName
        );
        attr.value = attr.nodeValue = '' + value;
        this.setAttributeNode(attr);
      },
      getAttributeNodeNS: function (namespaceURI, localName) {
        return this.attributes.getNamedItemNS(namespaceURI, localName);
      },
      getElementsByTagName: function (tagName) {
        return new LiveNodeList(this, function (base) {
          var ls = [];
          _visitNode(base, function (node) {
            if (
              node !== base &&
              node.nodeType == ELEMENT_NODE &&
              (tagName === '*' || node.tagName == tagName)
            ) {
              ls.push(node);
            }
          });
          return ls;
        });
      },
      getElementsByTagNameNS: function (namespaceURI, localName) {
        return new LiveNodeList(this, function (base) {
          var ls = [];
          _visitNode(base, function (node) {
            if (
              node !== base &&
              node.nodeType === ELEMENT_NODE &&
              (namespaceURI === '*' || node.namespaceURI === namespaceURI) &&
              (localName === '*' || node.localName == localName)
            ) {
              ls.push(node);
            }
          });
          return ls;
        });
      },
    };
    Document.prototype.getElementsByTagName =
      Element.prototype.getElementsByTagName;
    Document.prototype.getElementsByTagNameNS =
      Element.prototype.getElementsByTagNameNS;
    _extends(Element, Node);
    function Attr() {}
    Attr.prototype.nodeType = ATTRIBUTE_NODE;
    _extends(Attr, Node);
    function CharacterData() {}
    CharacterData.prototype = {
      data: '',
      substringData: function (offset, count) {
        return this.data.substring(offset, offset + count);
      },
      appendData: function (text) {
        text = this.data + text;
        this.nodeValue = this.data = text;
        this.length = text.length;
      },
      insertData: function (offset, text) {
        this.replaceData(offset, 0, text);
      },
      appendChild: function (newChild) {
        throw new Error(ExceptionMessage[HIERARCHY_REQUEST_ERR]);
      },
      deleteData: function (offset, count) {
        this.replaceData(offset, count, '');
      },
      replaceData: function (offset, count, text) {
        var start = this.data.substring(0, offset);
        var end = this.data.substring(offset + count);
        text = start + text + end;
        this.nodeValue = this.data = text;
        this.length = text.length;
      },
    };
    _extends(CharacterData, Node);
    function Text() {}
    Text.prototype = {
      nodeName: '#text',
      nodeType: TEXT_NODE,
      splitText: function (offset) {
        var text = this.data;
        var newText = text.substring(offset);
        text = text.substring(0, offset);
        this.data = this.nodeValue = text;
        this.length = text.length;
        var newNode = this.ownerDocument.createTextNode(newText);
        if (this.parentNode) {
          this.parentNode.insertBefore(newNode, this.nextSibling);
        }
        return newNode;
      },
    };
    _extends(Text, CharacterData);
    function Comment() {}
    Comment.prototype = {
      nodeName: '#comment',
      nodeType: COMMENT_NODE,
    };
    _extends(Comment, CharacterData);
    function CDATASection() {}
    CDATASection.prototype = {
      nodeName: '#cdata-section',
      nodeType: CDATA_SECTION_NODE,
    };
    _extends(CDATASection, CharacterData);
    function DocumentType() {}
    DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
    _extends(DocumentType, Node);
    function Notation() {}
    Notation.prototype.nodeType = NOTATION_NODE;
    _extends(Notation, Node);
    function Entity() {}
    Entity.prototype.nodeType = ENTITY_NODE;
    _extends(Entity, Node);
    function EntityReference() {}
    EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
    _extends(EntityReference, Node);
    function DocumentFragment() {}
    DocumentFragment.prototype.nodeName = '#document-fragment';
    DocumentFragment.prototype.nodeType = DOCUMENT_FRAGMENT_NODE;
    _extends(DocumentFragment, Node);
    function ProcessingInstruction() {}
    ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
    _extends(ProcessingInstruction, Node);
    function XMLSerializer() {}
    XMLSerializer.prototype.serializeToString = function (
      node,
      isHtml,
      nodeFilter
    ) {
      return nodeSerializeToString.call(node, isHtml, nodeFilter);
    };
    Node.prototype.toString = nodeSerializeToString;
    function nodeSerializeToString(isHtml, nodeFilter) {
      var buf = [];
      var refNode = this.nodeType == 9 ? this.documentElement : this;
      var prefix = refNode.prefix;
      var uri = refNode.namespaceURI;
      if (uri && prefix == null) {
        var prefix = refNode.lookupPrefix(uri);
        if (prefix == null) {
          var visibleNamespaces = [{ namespace: uri, prefix: null }];
        }
      }
      serializeToString(this, buf, isHtml, nodeFilter, visibleNamespaces);
      return buf.join('');
    }
    function needNamespaceDefine(node, isHTML, visibleNamespaces) {
      var prefix = node.prefix || '';
      var uri = node.namespaceURI;
      if (!prefix && !uri) {
        return false;
      }
      if (
        (prefix === 'xml' && uri === 'http://www.w3.org/XML/1998/namespace') ||
        uri == 'http://www.w3.org/2000/xmlns/'
      ) {
        return false;
      }
      var i = visibleNamespaces.length;
      while (i--) {
        var ns = visibleNamespaces[i];
        if (ns.prefix == prefix) {
          return ns.namespace != uri;
        }
      }
      return true;
    }
    function serializeToString(
      node,
      buf,
      isHTML,
      nodeFilter,
      visibleNamespaces
    ) {
      if (nodeFilter) {
        node = nodeFilter(node);
        if (node) {
          if (typeof node == 'string') {
            buf.push(node);
            return;
          }
        } else {
          return;
        }
      }
      switch (node.nodeType) {
        case ELEMENT_NODE:
          if (!visibleNamespaces) visibleNamespaces = [];
          var startVisibleNamespaces = visibleNamespaces.length;
          var attrs = node.attributes;
          var len = attrs.length;
          var child = node.firstChild;
          var nodeName = node.tagName;
          isHTML = htmlns === node.namespaceURI || isHTML;
          buf.push('<', nodeName);
          for (var i = 0; i < len; i++) {
            var attr = attrs.item(i);
            if (attr.prefix == 'xmlns') {
              visibleNamespaces.push({
                prefix: attr.localName,
                namespace: attr.value,
              });
            } else if (attr.nodeName == 'xmlns') {
              visibleNamespaces.push({ prefix: '', namespace: attr.value });
            }
          }
          for (var i = 0; i < len; i++) {
            var attr = attrs.item(i);
            if (needNamespaceDefine(attr, isHTML, visibleNamespaces)) {
              var prefix = attr.prefix || '';
              var uri = attr.namespaceURI;
              var ns = prefix ? ' xmlns:' + prefix : ' xmlns';
              buf.push(ns, '="', uri, '"');
              visibleNamespaces.push({ prefix, namespace: uri });
            }
            serializeToString(attr, buf, isHTML, nodeFilter, visibleNamespaces);
          }
          if (needNamespaceDefine(node, isHTML, visibleNamespaces)) {
            var prefix = node.prefix || '';
            var uri = node.namespaceURI;
            var ns = prefix ? ' xmlns:' + prefix : ' xmlns';
            buf.push(ns, '="', uri, '"');
            visibleNamespaces.push({ prefix, namespace: uri });
          }
          if (
            child ||
            (isHTML && !/^(?:meta|link|img|br|hr|input)$/i.test(nodeName))
          ) {
            buf.push('>');
            if (isHTML && /^script$/i.test(nodeName)) {
              while (child) {
                if (child.data) {
                  buf.push(child.data);
                } else {
                  serializeToString(
                    child,
                    buf,
                    isHTML,
                    nodeFilter,
                    visibleNamespaces
                  );
                }
                child = child.nextSibling;
              }
            } else {
              while (child) {
                serializeToString(
                  child,
                  buf,
                  isHTML,
                  nodeFilter,
                  visibleNamespaces
                );
                child = child.nextSibling;
              }
            }
            buf.push('</', nodeName, '>');
          } else {
            buf.push('/>');
          }
          return;
        case DOCUMENT_NODE:
        case DOCUMENT_FRAGMENT_NODE:
          var child = node.firstChild;
          while (child) {
            serializeToString(
              child,
              buf,
              isHTML,
              nodeFilter,
              visibleNamespaces
            );
            child = child.nextSibling;
          }
          return;
        case ATTRIBUTE_NODE:
          return buf.push(
            ' ',
            node.name,
            '="',
            node.value.replace(/[<&"]/g, _xmlEncoder),
            '"'
          );
        case TEXT_NODE:
          return buf.push(node.data.replace(/[<&]/g, _xmlEncoder));
        case CDATA_SECTION_NODE:
          return buf.push('<![CDATA[', node.data, ']]>');
        case COMMENT_NODE:
          return buf.push('<!--', node.data, '-->');
        case DOCUMENT_TYPE_NODE:
          var pubid = node.publicId;
          var sysid = node.systemId;
          buf.push('<!DOCTYPE ', node.name);
          if (pubid) {
            buf.push(' PUBLIC "', pubid);
            if (sysid && sysid != '.') {
              buf.push('" "', sysid);
            }
            buf.push('">');
          } else if (sysid && sysid != '.') {
            buf.push(' SYSTEM "', sysid, '">');
          } else {
            var sub = node.internalSubset;
            if (sub) {
              buf.push(' [', sub, ']');
            }
            buf.push('>');
          }
          return;
        case PROCESSING_INSTRUCTION_NODE:
          return buf.push('<?', node.target, ' ', node.data, '?>');
        case ENTITY_REFERENCE_NODE:
          return buf.push('&', node.nodeName, ';');
        default:
          buf.push('??', node.nodeName);
      }
    }
    function importNode(doc, node, deep) {
      var node2;
      switch (node.nodeType) {
        case ELEMENT_NODE:
          node2 = node.cloneNode(false);
          node2.ownerDocument = doc;
        case DOCUMENT_FRAGMENT_NODE:
          break;
        case ATTRIBUTE_NODE:
          deep = true;
          break;
      }
      if (!node2) {
        node2 = node.cloneNode(false);
      }
      node2.ownerDocument = doc;
      node2.parentNode = null;
      if (deep) {
        var child = node.firstChild;
        while (child) {
          node2.appendChild(importNode(doc, child, deep));
          child = child.nextSibling;
        }
      }
      return node2;
    }
    function cloneNode(doc, node, deep) {
      var node2 = new node.constructor();
      for (var n in node) {
        var v = node[n];
        if (typeof v != 'object') {
          if (v != node2[n]) {
            node2[n] = v;
          }
        }
      }
      if (node.childNodes) {
        node2.childNodes = new NodeList();
      }
      node2.ownerDocument = doc;
      switch (node2.nodeType) {
        case ELEMENT_NODE:
          var attrs = node.attributes;
          var attrs2 = (node2.attributes = new NamedNodeMap());
          var len = attrs.length;
          attrs2._ownerElement = node2;
          for (var i = 0; i < len; i++) {
            node2.setAttributeNode(cloneNode(doc, attrs.item(i), true));
          }
          break;
        case ATTRIBUTE_NODE:
          deep = true;
      }
      if (deep) {
        var child = node.firstChild;
        while (child) {
          node2.appendChild(cloneNode(doc, child, deep));
          child = child.nextSibling;
        }
      }
      return node2;
    }
    function __set__(object, key, value) {
      object[key] = value;
    }
    try {
      if (Object.defineProperty) {
        let getTextContent2 = function (node) {
          switch (node.nodeType) {
            case ELEMENT_NODE:
            case DOCUMENT_FRAGMENT_NODE:
              var buf = [];
              node = node.firstChild;
              while (node) {
                if (node.nodeType !== 7 && node.nodeType !== 8) {
                  buf.push(getTextContent2(node));
                }
                node = node.nextSibling;
              }
              return buf.join('');
            default:
              return node.nodeValue;
          }
        };
        getTextContent = getTextContent2;
        Object.defineProperty(LiveNodeList.prototype, 'length', {
          get: function () {
            _updateLiveList(this);
            return this.$$length;
          },
        });
        Object.defineProperty(Node.prototype, 'textContent', {
          get: function () {
            return getTextContent2(this);
          },
          set: function (data) {
            switch (this.nodeType) {
              case ELEMENT_NODE:
              case DOCUMENT_FRAGMENT_NODE:
                while (this.firstChild) {
                  this.removeChild(this.firstChild);
                }
                if (data || String(data)) {
                  this.appendChild(this.ownerDocument.createTextNode(data));
                }
                break;
              default:
                this.data = data;
                this.value = data;
                this.nodeValue = data;
            }
          },
        });
        __set__ = function (object, key, value) {
          object['$$' + key] = value;
        };
      }
    } catch (e) {}
    var getTextContent;
    exports.DOMImplementation = DOMImplementation;
    exports.XMLSerializer = XMLSerializer;
  },
});

// node_modules/xmldom/dom-parser.js
var require_dom_parser = __commonJS({
  'node_modules/xmldom/dom-parser.js'(exports) {
    function DOMParser(options) {
      this.options = options || { locator: {} };
    }
    DOMParser.prototype.parseFromString = function (source, mimeType) {
      var options = this.options;
      var sax = new XMLReader();
      var domBuilder = options.domBuilder || new DOMHandler();
      var errorHandler = options.errorHandler;
      var locator = options.locator;
      var defaultNSMap = options.xmlns || {};
      var entityMap = { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" };
      if (locator) {
        domBuilder.setDocumentLocator(locator);
      }
      sax.errorHandler = buildErrorHandler(errorHandler, domBuilder, locator);
      sax.domBuilder = options.domBuilder || domBuilder;
      if (/\/x?html?$/.test(mimeType)) {
        entityMap.nbsp = '\xA0';
        entityMap.copy = '\xA9';
        defaultNSMap[''] = 'http://www.w3.org/1999/xhtml';
      }
      defaultNSMap.xml =
        defaultNSMap.xml || 'http://www.w3.org/XML/1998/namespace';
      if (source) {
        sax.parse(source, defaultNSMap, entityMap);
      } else {
        sax.errorHandler.error('invalid doc source');
      }
      return domBuilder.doc;
    };
    function buildErrorHandler(errorImpl, domBuilder, locator) {
      if (!errorImpl) {
        if (domBuilder instanceof DOMHandler) {
          return domBuilder;
        }
        errorImpl = domBuilder;
      }
      var errorHandler = {};
      var isCallback = errorImpl instanceof Function;
      locator = locator || {};
      function build(key) {
        var fn = errorImpl[key];
        if (!fn && isCallback) {
          fn =
            errorImpl.length == 2
              ? function (msg) {
                  errorImpl(key, msg);
                }
              : errorImpl;
        }
        errorHandler[key] =
          (fn &&
            function (msg) {
              fn('[xmldom ' + key + ']	' + msg + _locator(locator));
            }) ||
          function () {};
      }
      build('warning');
      build('error');
      build('fatalError');
      return errorHandler;
    }
    function DOMHandler() {
      this.cdata = false;
    }
    function position(locator, node) {
      node.lineNumber = locator.lineNumber;
      node.columnNumber = locator.columnNumber;
    }
    DOMHandler.prototype = {
      startDocument: function () {
        this.doc = new DOMImplementation().createDocument(null, null, null);
        if (this.locator) {
          this.doc.documentURI = this.locator.systemId;
        }
      },
      startElement: function (namespaceURI, localName, qName, attrs) {
        var doc = this.doc;
        var el = doc.createElementNS(namespaceURI, qName || localName);
        var len = attrs.length;
        appendElement(this, el);
        this.currentElement = el;
        this.locator && position(this.locator, el);
        for (var i = 0; i < len; i++) {
          var namespaceURI = attrs.getURI(i);
          var value = attrs.getValue(i);
          var qName = attrs.getQName(i);
          var attr = doc.createAttributeNS(namespaceURI, qName);
          this.locator && position(attrs.getLocator(i), attr);
          attr.value = attr.nodeValue = value;
          el.setAttributeNode(attr);
        }
      },
      endElement: function (namespaceURI, localName, qName) {
        var current = this.currentElement;
        var tagName = current.tagName;
        this.currentElement = current.parentNode;
      },
      startPrefixMapping: function (prefix, uri) {},
      endPrefixMapping: function (prefix) {},
      processingInstruction: function (target, data) {
        var ins = this.doc.createProcessingInstruction(target, data);
        this.locator && position(this.locator, ins);
        appendElement(this, ins);
      },
      ignorableWhitespace: function (ch, start, length) {},
      characters: function (chars, start, length) {
        chars = _toString.apply(this, arguments);
        if (chars) {
          if (this.cdata) {
            var charNode = this.doc.createCDATASection(chars);
          } else {
            var charNode = this.doc.createTextNode(chars);
          }
          if (this.currentElement) {
            this.currentElement.appendChild(charNode);
          } else if (/^\s*$/.test(chars)) {
            this.doc.appendChild(charNode);
          }
          this.locator && position(this.locator, charNode);
        }
      },
      skippedEntity: function (name) {},
      endDocument: function () {
        this.doc.normalize();
      },
      setDocumentLocator: function (locator) {
        if ((this.locator = locator)) {
          locator.lineNumber = 0;
        }
      },
      comment: function (chars, start, length) {
        chars = _toString.apply(this, arguments);
        var comm = this.doc.createComment(chars);
        this.locator && position(this.locator, comm);
        appendElement(this, comm);
      },
      startCDATA: function () {
        this.cdata = true;
      },
      endCDATA: function () {
        this.cdata = false;
      },
      startDTD: function (name, publicId, systemId) {
        var impl = this.doc.implementation;
        if (impl && impl.createDocumentType) {
          var dt = impl.createDocumentType(name, publicId, systemId);
          this.locator && position(this.locator, dt);
          appendElement(this, dt);
        }
      },
      warning: function (error) {
        console.warn('[xmldom warning]	' + error, _locator(this.locator));
      },
      error: function (error) {
        console.error('[xmldom error]	' + error, _locator(this.locator));
      },
      fatalError: function (error) {
        console.error('[xmldom fatalError]	' + error, _locator(this.locator));
        throw error;
      },
    };
    function _locator(l) {
      if (l) {
        return (
          '\n@' +
          (l.systemId || '') +
          '#[line:' +
          l.lineNumber +
          ',col:' +
          l.columnNumber +
          ']'
        );
      }
    }
    function _toString(chars, start, length) {
      if (typeof chars == 'string') {
        return chars.substr(start, length);
      } else {
        if (chars.length >= start + length || start) {
          return new java.lang.String(chars, start, length) + '';
        }
        return chars;
      }
    }
    'endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl'.replace(
      /\w+/g,
      function (key) {
        DOMHandler.prototype[key] = function () {
          return null;
        };
      }
    );
    function appendElement(hander, node) {
      if (!hander.currentElement) {
        hander.doc.appendChild(node);
      } else {
        hander.currentElement.appendChild(node);
      }
    }
    var XMLReader = require_sax().XMLReader;
    var DOMImplementation = (exports.DOMImplementation =
      require_dom().DOMImplementation);
    exports.XMLSerializer = require_dom().XMLSerializer;
    exports.DOMParser = DOMParser;
  },
});

// node_modules/jxon/jxon.js
var require_jxon = __commonJS({
  'node_modules/jxon/jxon.js'(exports, module2) {
    (function (root, factory) {
      if (typeof define === 'function' && define.amd) {
        define([], factory(window));
      } else if (typeof exports === 'object') {
        if (
          typeof window === 'object' &&
          window.DOMImplementation &&
          window.XMLSerializer &&
          window.DOMParser
        ) {
          module2.exports = factory(window);
        } else {
          module2.exports = factory(require_dom_parser(), true);
        }
      } else {
        root.JXON = factory(window);
      }
    })(exports, function (xmlDom, isNodeJs) {
      var opts = {
        valueKey: '_',
        attrKey: '$',
        attrPrefix: '$',
        lowerCaseTags: false,
        trueIsEmpty: false,
        autoDate: false,
        ignorePrefixedNodes: false,
        parseValues: false,
      };
      var aCache = [];
      var rIsNull = /^\s*$/;
      var rIsBool = /^(?:true|false)$/i;
      var DOMParser;
      return new (function () {
        this.config = function (cfg) {
          for (var k in cfg) {
            opts[k] = cfg[k];
          }
          if (opts.parserErrorHandler) {
            DOMParser = new xmlDom.DOMParser({
              errorHandler: opts.parserErrorHandler,
              locator: {},
            });
          }
        };
        function parseText(sValue) {
          if (!opts.parseValues) {
            return sValue;
          }
          if (rIsNull.test(sValue)) {
            return null;
          }
          if (rIsBool.test(sValue)) {
            return sValue.toLowerCase() === 'true';
          }
          if (isFinite(sValue)) {
            return parseFloat(sValue);
          }
          if (opts.autoDate && isFinite(Date.parse(sValue))) {
            return new Date(sValue);
          }
          return sValue;
        }
        function EmptyTree() {}
        EmptyTree.prototype.toString = function () {
          return 'null';
        };
        EmptyTree.prototype.valueOf = function () {
          return null;
        };
        function objectify(vValue) {
          return vValue === null
            ? new EmptyTree()
            : vValue instanceof Object
            ? vValue
            : new vValue.constructor(vValue);
        }
        function createObjTree(oParentNode, nVerb, bFreeze, bNesteAttr) {
          var CDATA = 4,
            TEXT = 3,
            ELEMENT = 1,
            nLevelStart = aCache.length,
            bChildren = oParentNode.hasChildNodes(),
            bAttributes =
              oParentNode.nodeType === oParentNode.ELEMENT_NODE &&
              oParentNode.hasAttributes(),
            bHighVerb = Boolean(nVerb & 2),
            nLength = 0,
            sCollectedTxt = '',
            vResult = bHighVerb ? {} : opts.trueIsEmpty ? true : '',
            sProp,
            vContent;
          if (bChildren) {
            for (
              var oNode, nItem = 0;
              nItem < oParentNode.childNodes.length;
              nItem++
            ) {
              oNode = oParentNode.childNodes.item(nItem);
              if (oNode.nodeType === CDATA) {
                sCollectedTxt += oNode.nodeValue;
              } else if (oNode.nodeType === TEXT) {
                sCollectedTxt += oNode.nodeValue.trim();
              } else if (
                oNode.nodeType === ELEMENT &&
                !(opts.ignorePrefixedNodes && oNode.prefix)
              ) {
                aCache.push(oNode);
              }
            }
          }
          var nLevelEnd = aCache.length,
            vBuiltVal = parseText(sCollectedTxt);
          if (!bHighVerb && (bChildren || bAttributes)) {
            vResult = nVerb === 0 ? objectify(vBuiltVal) : {};
          }
          for (var nElId = nLevelStart; nElId < nLevelEnd; nElId++) {
            sProp = aCache[nElId].nodeName;
            if (opts.lowerCaseTags) {
              sProp = sProp.toLowerCase();
            }
            vContent = createObjTree(aCache[nElId], nVerb, bFreeze, bNesteAttr);
            if (vResult.hasOwnProperty(sProp)) {
              if (vResult[sProp].constructor !== Array) {
                vResult[sProp] = [vResult[sProp]];
              }
              vResult[sProp].push(vContent);
            } else {
              vResult[sProp] = vContent;
              nLength++;
            }
          }
          if (bAttributes) {
            var nAttrLen = oParentNode.attributes.length,
              sAPrefix = bNesteAttr ? '' : opts.attrPrefix,
              oAttrParent = bNesteAttr ? {} : vResult;
            for (
              var oAttrib, oAttribName, nAttrib = 0;
              nAttrib < nAttrLen;
              nLength++, nAttrib++
            ) {
              oAttrib = oParentNode.attributes.item(nAttrib);
              oAttribName = oAttrib.name;
              if (opts.lowerCaseTags) {
                oAttribName = oAttribName.toLowerCase();
              }
              oAttrParent[sAPrefix + oAttribName] = parseText(
                oAttrib.value.trim()
              );
            }
            if (bNesteAttr) {
              if (bFreeze) {
                Object.freeze(oAttrParent);
              }
              vResult[opts.attrKey] = oAttrParent;
              nLength -= nAttrLen - 1;
            }
          }
          if (
            nVerb === 3 ||
            ((nVerb === 2 || (nVerb === 1 && nLength > 0)) && sCollectedTxt)
          ) {
            vResult[opts.valueKey] = vBuiltVal;
          } else if (!bHighVerb && nLength === 0 && sCollectedTxt) {
            vResult = vBuiltVal;
          }
          if (bFreeze && (bHighVerb || nLength > 0)) {
            Object.freeze(vResult);
          }
          aCache.length = nLevelStart;
          return vResult;
        }
        function loadObjTree(oXMLDoc, oParentEl, oParentObj) {
          var vValue, oChild, elementNS;
          if (
            oParentObj.constructor === String ||
            oParentObj.constructor === Number ||
            oParentObj.constructor === Boolean
          ) {
            oParentEl.appendChild(
              oXMLDoc.createTextNode(oParentObj.toString())
            );
            if (oParentObj === oParentObj.valueOf()) {
              return;
            }
          } else if (oParentObj.constructor === Date) {
            oParentEl.appendChild(
              oXMLDoc.createTextNode(oParentObj.toISOString())
            );
          }
          for (var sName in oParentObj) {
            vValue = oParentObj[sName];
            if (vValue === void 0) {
              continue;
            }
            if (vValue === null) {
              vValue = {};
            }
            if (isFinite(sName) || vValue instanceof Function) {
              continue;
            }
            if (sName === opts.valueKey) {
              if (vValue !== null && vValue !== true) {
                oParentEl.appendChild(
                  oXMLDoc.createTextNode(
                    vValue.constructor === Date
                      ? vValue.toISOString()
                      : String(vValue)
                  )
                );
              }
            } else if (sName === opts.attrKey) {
              for (var sAttrib in vValue) {
                oParentEl.setAttribute(sAttrib, vValue[sAttrib]);
              }
            } else if (sName === opts.attrPrefix + 'xmlns') {
              if (isNodeJs) {
                oParentEl.setAttribute(sName.slice(1), vValue);
              }
            } else if (sName.charAt(0) === opts.attrPrefix) {
              oParentEl.setAttribute(sName.slice(1), vValue);
            } else if (vValue.constructor === Array) {
              for (var nItem in vValue) {
                if (!vValue.hasOwnProperty(nItem)) continue;
                elementNS =
                  (vValue[nItem] && vValue[nItem][opts.attrPrefix + 'xmlns']) ||
                  oParentEl.namespaceURI;
                if (elementNS) {
                  oChild = oXMLDoc.createElementNS(elementNS, sName);
                } else {
                  oChild = oXMLDoc.createElement(sName);
                }
                loadObjTree(oXMLDoc, oChild, vValue[nItem] || {});
                oParentEl.appendChild(oChild);
              }
            } else {
              elementNS =
                (vValue || {})[opts.attrPrefix + 'xmlns'] ||
                oParentEl.namespaceURI;
              if (elementNS) {
                oChild = oXMLDoc.createElementNS(elementNS, sName);
              } else {
                oChild = oXMLDoc.createElement(sName);
              }
              if (vValue instanceof Object) {
                loadObjTree(oXMLDoc, oChild, vValue);
              } else if (
                vValue !== null &&
                (vValue !== true || !opts.trueIsEmpty)
              ) {
                oChild.appendChild(oXMLDoc.createTextNode(vValue.toString()));
              }
              oParentEl.appendChild(oChild);
            }
          }
        }
        this.xmlToJs = this.build = function (
          oXMLParent,
          nVerbosity,
          bFreeze,
          bNesteAttributes
        ) {
          var _nVerb =
            arguments.length > 1 && typeof nVerbosity === 'number'
              ? nVerbosity & 3
              : 1;
          return createObjTree(
            oXMLParent,
            _nVerb,
            bFreeze || false,
            arguments.length > 3 ? bNesteAttributes : _nVerb === 3
          );
        };
        this.jsToXml = this.unbuild = function (
          oObjTree,
          sNamespaceURI,
          sQualifiedName,
          oDocumentType
        ) {
          var documentImplementation =
            (xmlDom.document && xmlDom.document.implementation) ||
            new xmlDom.DOMImplementation();
          var oNewDoc = documentImplementation.createDocument(
            sNamespaceURI || null,
            sQualifiedName || '',
            oDocumentType || null
          );
          loadObjTree(oNewDoc, oNewDoc.documentElement || oNewDoc, oObjTree);
          return oNewDoc;
        };
        this.stringToXml = function (xmlStr) {
          if (!DOMParser) {
            DOMParser = new xmlDom.DOMParser();
          }
          return DOMParser.parseFromString(xmlStr, 'application/xml');
        };
        this.xmlToString = function (xmlObj) {
          if (typeof xmlObj.xml !== 'undefined') {
            return xmlObj.xml;
          } else {
            return new xmlDom.XMLSerializer().serializeToString(xmlObj);
          }
        };
        this.stringToJs = function (str) {
          var xmlObj = this.stringToXml(str);
          return this.xmlToJs(xmlObj);
        };
        this.jsToString = this.stringify = function (
          oObjTree,
          sNamespaceURI,
          sQualifiedName,
          oDocumentType
        ) {
          return this.xmlToString(
            this.jsToXml(oObjTree, sNamespaceURI, sQualifiedName, oDocumentType)
          );
        };
        this.each = function (arr, func, thisArg) {
          if (arr instanceof Array) {
            arr.forEach(func, thisArg);
          } else {
            [arr].forEach(func, thisArg);
          }
        };
      })();
    });
  },
});

// node_modules/await-to-js/dist/await-to-js.umd.js
var require_await_to_js_umd = __commonJS({
  'node_modules/await-to-js/dist/await-to-js.umd.js'(exports, module2) {
    (function (global, factory) {
      typeof exports === 'object' && typeof module2 !== 'undefined'
        ? factory(exports)
        : typeof define === 'function' && define.amd
        ? define(['exports'], factory)
        : factory((global.awaitToJs = {}));
    })(exports, function (exports2) {
      'use strict';
      function to2(promise, errorExt) {
        return promise
          .then(function (data) {
            return [null, data];
          })
          .catch(function (err) {
            if (errorExt) {
              Object.assign(err, errorExt);
            }
            return [err, void 0];
          });
      }
      exports2.to = to2;
      exports2['default'] = to2;
      Object.defineProperty(exports2, '__esModule', { value: true });
    });
  },
});

// src/libs.ts
var libs_exports = {};
__export(libs_exports, {
  jxon: () => import_jxon.default,
  to: () => import_await_to_js.default,
});
module.exports = __toCommonJS(libs_exports);
var import_jxon = __toESM(require_jxon());
var import_await_to_js = __toESM(require_await_to_js_umd());
// Annotate the CommonJS export names for ESM import in node:
0 &&
  (module.exports = {
    jxon,
    to,
  });
