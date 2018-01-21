
var copyAndConvertToMarkdownContextMenuId = chrome.contextMenus.create({
    title: "copy and convert to markdown",
    type: "normal",
    contexts: ["page", "selection", "link", "image"]
});

chrome.contextMenus.create({
  parentId: copyAndConvertToMarkdownContextMenuId,
  title: "page [title] (url) ",
  type: "normal",
  contexts: ["page"],
  onclick: function(info, tab){
    ConvertMarkdown.pageTo(tab.title, tab.url, {});
  }
});

chrome.contextMenus.create({
  parentId: copyAndConvertToMarkdownContextMenuId,
  title: "convert selection to markdown",
  type: "normal",
  contexts: ["selection"],
  onclick: function(info, tab){
    chrome.tabs.sendRequest(tab.id, {type: 'getSelectionHtml', configOptions: get_options()}, function(selectionHtml){
      ConvertMarkdown.selectionTo(selectionHtml, {formate: "markdown"});
    });
  }
});

chrome.contextMenus.create({
  parentId: copyAndConvertToMarkdownContextMenuId,
  title: "convert selection to markdown(contain published)",
  type: "normal",
  contexts: ["selection"],
  onclick: function(info, tab){
    chrome.tabs.sendRequest(tab.id, {type: 'getSelectionHtml', configOptions: get_options()}, function(selectionHtml){
      ConvertMarkdown.selectionTo(selectionHtml, {
        formate: "markdown", 
        published: {title: tab.title, url: tab.url}
      });
    });
  }
});

chrome.contextMenus.create({
  parentId: copyAndConvertToMarkdownContextMenuId,
  title: "convert selection to markdown(contain title and published)",
  type: "normal",
  contexts: ["selection"],
  onclick: function(info, tab){
    chrome.tabs.sendRequest(tab.id, {type: 'getSelectionHtml', configOptions: get_options()}, function(selectionHtml){
      ConvertMarkdown.selectionTo(selectionHtml, {
        formate: "markdown", 
        published: {title: tab.title, url: tab.url},
        title: tab.title
      });
    });
  }
});

chrome.contextMenus.create({
  parentId: copyAndConvertToMarkdownContextMenuId,
  title: "link [title] (url)",
  type: "normal",
  contexts: ["link"],
  onclick: function(info, tab){
    var linkText = "";

    if (info.mediaType === "image") {
      linkText = "![]("+info.srcUrl+")";
    } else {
      linkText = info.selectionText;
    }
    ConvertMarkdown.linkTo(linkText, info.linkUrl, {});
  }
});

chrome.contextMenus.create({
  parentId: copyAndConvertToMarkdownContextMenuId,
  title: "image [title] (url)",
  type: "normal",
  contexts: ["image"],
  onclick: function(info, tab){
    ConvertMarkdown.imageTo("", info.srcUrl, {});
  }
});

var ConvertMarkdown = new (function(){
  function copyToClipboard(text){
    var $copy = $('#copy');
    $copy.text(text);
    $copy[0].select();
    document.execCommand('copy');
  }
  function convertToMarkdown(source, options){
    var result = source;
    var _$container = $("<div></div>");
    _$container.html(source);
    //删除掉不需要的元素
    //适配博客园
    _$container.find(".cnblogs_code_toolbar").remove();
    // 适配使用 syntaxhighlighter 的高亮插件
    _$container.find(".syntaxhighlighter").map(function(index, element){
      var $element = $(element);
      var language = null;
      for (var _i=0; _i < element.classList.length; _i++){
        var className = element.classList[_i];
        if (!/^syntaxhighlighter|syntaxhighlighter$/i.test(className)){
          language = className;
          break
        }
      }
      var $code = $element.find('.code');
      if ($code.length > 0) {
        $code.find('.line').append('\n');
        var codeContent = $code.text();
        var $div = $('<div></div>');
        $div.text(codeContent);
        codeContent = $div.html();
        if (language){
          $element.replaceWith("<div class='highlight highlight-" + language+ "'><pre>" +codeContent+ "</pre></div>");
        } else {
          $element.replaceWith("<pre><code>" +codeContent+ "</code></pre>");
        }
      }
    });
    result = _$container.html();
    if(!!options && options.formate == 'markdown'){
      var cleanSource = $.htmlClean(result, {
    replaceStyles: [],
    allowedTags:["div", "a","abbr","acronym","address","area","b","bdo","big","blockquote","br","caption","center","cite","code","col","colgroup","dd","del","dfn","dl","dt","em","h1","h2","h3","h4","h5","h6","hr","i","img","ins","kbd","li","map","ol","p","pre","q","s","samp","small","strike","strong","sub","sup","table","tbody","td","tfoot","th","thead","tr","tt","u","ul"],
    allowedAttributes: [['title'], ['id'], ['class'], ['alt'], ['src'], ['href'], ['a'], ['start'], ['name', ['a']]],
    removeTags: ["basefont", "dir", "font", "frame", "frameset", "iframe", "isindex", "menu", "noframes"]
      });
      var configOptions = get_options();
      if (configOptions.render == 'remarked'){
        var reMarker = new reMarked(get_options());
        result = reMarker.render(cleanSource);
      } else if (configOptions.render == 'html2markdown') {
        result = html2markdown(cleanSource, options);
      } else {
        var prettyPrintConverter = {
          filter: function (node) {
            return node.nodeName === 'PRE' &&
            node.className === 'prettyprint'
          },
          replacement: function (content, node) {
            return '\n\n```' + '\n' + node.textContent + '\n```\n\n'
          }
        };
        var preConverter = {
          filter: function (node) {
            return node.nodeName === 'PRE'
          },
          replacement: function (content, node) {
            var lang = '';
            // 适配 github 的代码高亮写法
            var highlightRegEx = /highlight highlight-(\S+)/;
            if (node.parentNode.nodeName === 'DIV' && highlightRegEx.test(node.parentNode.className)){
              lang = node.parentNode.className.match(highlightRegEx)[1]
            }
            // 适配 highlightjs 的代码高亮写法
            if (node.firstChild && node.firstChild.nodeName === 'CODE'){
              var codeEl = node.firstChild;
              for (var _i=0; _i < codeEl.classList.length; _i++){
                var className = codeEl.classList[_i];
                if (!/^hljs$/i.test(className)){
                  lang = className;
                  break
                }
              }
            }
            if (lang){
              lang = ' ' + lang;
            }
            return '\n\n```' + lang + '\n' + node.textContent + '\n```\n\n'
          }
        };
        var supConverter = {
          filter: 'sup',
          replacement: function (content) {
            return '^' + content + '^'
          }
        };
        var subConverter = {
          filter: 'sub',
          replacement: function (content) {
            return '~' + content + '~'
          }
        };
        var markConverter = {
          filter: function(node){
            return node.nodeName === 'MARK' || (node.nodeName === 'SPAN' && node.getAttribute('class') === 'mark');
          },
          replacement: function (content) {
            return '==' + content + '=='
          }
        };
        var hrefConverter = {
          filter: function (node){
            return node.nodeName === 'A' && node.getAttribute('href');
          },
          replacement: function(content, node){
            var url = node.getAttribute('href');
            var titlePart = node.title ? ' "' + node.title + '"' : '';
            if (content === url) {
              return '<' + url + '>';
            }else if (url.match('mailto:' + content)) {
              return '<' + content + '>'
            } else {
              return '[' + content + '](' + url + titlePart + ')'
            }
          }
        };

        var dlConverter = {
          filter: 'dl',
          replacement: function(content){
            return content
          }
        }

        var dtConverter = {
          filter: 'dt',
          replacement: function(content){
            return '\n\n' + content
          }
        }
        var ddConverter = {
          filter: 'dd',
          replacement: function(content){
            return '\n: ' + content
          }
        }
        var divConverter = {
          filter: 'div',
          replacement: function (content) { return content }
        };
        result = toMarkdown(cleanSource, {gfm: true, converters: [prettyPrintConverter, preConverter, supConverter, subConverter, markConverter, hrefConverter, dlConverter, dtConverter, ddConverter, divConverter]})
      }
    }
    if(!!options && !!options.published){
      result += "\n\n published from :[" + options.published.title + "](" + options.published.url +")";
    }
    if (!!options && !!options.title){
      result = "# " + options.title + "\n\n" + result;
    }
    return result;
  }
  function generateImageMarkdownCode(title, url, options){
    return "[" + title + "](" + url + ")"; 
  }
  function generateLinkMarkdownCode(title, url, options){
    return "[" + title + "](" + url + ")"; 
  }
  return {
    imageTo: function(title, url, options){
      copyToClipboard(generateImageMarkdownCode(title, url, options));
    },
    linkTo: function(title, url, options){
      copyToClipboard(generateLinkMarkdownCode(title, url, options));
    },
    pageTo: function(title, url, options){
      this.linkTo(title, url, options);
    },
    selectionTo: function(source, options){
      copyToClipboard(convertToMarkdown(source, options));
    }

  }
});
