function getSelectionHtml(configOptions) {
    var html = "";
    if (typeof window.getSelection != "undefined") {
        var sel = window.getSelection();
        if (sel.type == 'Range' && sel.rangeCount > 0) {
            var container = document.createElement("div");
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
            }
            if(!!configOptions.img_url){
              var imgs = container.querySelectorAll('img');
              for(var i=0; i<imgs.length; i++){
                imgs[i].setAttribute('src', imgs[i].src);
              }
            }
            if(!!configOptions.href_url){
              var hrefs = container.querySelectorAll('a');
              for(var i=0; i<hrefs.length; i++){
                hrefs[i].setAttribute('href', hrefs[i].href);
              }
            }
            html = container.innerHTML;
        }
    } else if (typeof document.selection != "undefined") {
        if (document.selection.type == "Text") {
            html = document.selection.createRange().htmlText;
        }
    }
    return html;
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
  if(request.type == 'getSelectionHtml'){
    var htmlContent = getSelectionHtml(request.configOptions);
    sendResponse(htmlContent);
  }
});

