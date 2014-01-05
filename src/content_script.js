function getSelectionHtml() {
    var html = "";
    if (typeof window.getSelection != "undefined") {
        var sel = window.getSelection();
        if (sel.type == 'Range' && sel.rangeCount > 0) {
            var container = document.createElement("div");
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
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
    var htmlContent = getSelectionHtml();
    sendResponse(htmlContent);
  }
});

