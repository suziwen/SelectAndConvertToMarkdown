
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
    if(!!options && options.formate == 'markdown'){
      var cleanSource = $.htmlClean(source, {
    replaceStyles: [],
    allowedTags:["a","abbr","acronym","address","area","b","bdo","big","blockquote","br","caption","center","cite","code","col","colgroup","dd","del","dfn","dl","dt","em","h1","h2","h3","h4","h5","h6","hr","i","img","ins","kbd","li","map","ol","p","pre","q","s","samp","small","strike","strong","sub","sup","table","tbody","td","tfoot","th","thead","tr","tt","u","ul"],
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
        result = toMarkdown(cleanSource, {gfm: true})
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
