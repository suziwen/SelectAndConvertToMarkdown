
var default_options = {
    render: 'html2markdown',
    img_url: true, 
    href_url: true, 
    link_list:  false,    // render links as references, create link list as appendix
    h1_setext:  true,     // underline h1 headers
    h2_setext:  true,     // underline h2 headers
    h_atx_suf:  false,    // header suffixes (###)
    gfm_code:   true,    // gfm code blocks (```)
    li_bullet:  "*",      // list item bullet style
    hr_char:    "-",      // hr style
    indnt_str:  "    ",   // indentation string
    bold_char:  "*",      // char used for strong
    emph_char:  "_",      // char used for em
    gfm_del:    true,     // ~~strikeout~~ for <del>strikeout</del>
    gfm_tbls:   true,     // markdown-extra tables
    tbl_edges:  false,    // show side edges on tables
    hash_lnks:  false,    // anchors w/hash hrefs as links
    br_only:    false,    // avoid using "  " as line break indicator
    col_pre:    "col ",   // column prefix to use when creating missing headers for tables
    unsup_tags: {         // handling of unsupported tags, defined in terms of desired output style. if not listed, output = outerHTML
        // no output
        ignore: "script style noscript",
        // eg: "<tag>some content</tag>"
        inline: "",
        // eg: "\n\n<tag>\n\tsome content\n</tag>"
        block2: "",
        // eg: "\n<tag>some content</tag>"
        block1c: "",
        // eg: "\n\n<tag>some content</tag>"
        // block2c: "canvas audio video iframe",
    }
}

function save_options(){
  var render = $('input[name="render"]:checked').val();
  var options = {
    'render': render
    ,'link_list': $('#link_list')[0].checked
    ,'h1_setext': $('#h1_setext')[0].checked
    ,'h2_setext': $('#h2_setext')[0].checked
    ,'h_atx_suf': $('#h_atx_suf')[0].checked
    ,'gfm_code': $('#gfm_code')[0].checked
    ,'gfm_del': $('#gfm_del')[0].checked
    ,'gfm_tbls': $('#gfm_tbls')[0].checked
    ,'tbl_edges': $('#tbl_edges')[0].checked
    ,'hash_lnks': $('#hash_lnks')[0].checked
    ,'br_only': $('#br_only')[0].checked
    ,'img_url': $('#img_url')[0].checked
    ,'href_url': $('#href_url')[0].checked
  }
  options = $.extend(true, {}, default_options, options)
  localStorage['copy_convert_to_markdown'] =  JSON.stringify(options)
}

function set_options(options){
    $('#link_list')[0].checked = options.link_list;
    $('#h1_setext')[0].checked = options.h1_setext;
    $('#h2_setext')[0].checked = options.h2_setext;
    $('#h_atx_suf')[0].checked = options.h_atx_suf;
    $('#gfm_code')[0].checked = options.gfm_code;
    $('#gfm_del')[0].checked = options.gfm_del;
    $('#gfm_tbls')[0].checked = options.gfm_tbls;
    $('#tbl_edges')[0].checked = options.tbl_edges;
    $('#hash_lnks')[0].checked = options.hash_lnks;
    $('#br_only')[0].checked = options.br_only;
    $('#img_url')[0].checked = options.img_url;
    $('#href_url')[0].checked = options.href_url;
    if (options.render == 'html2markdown'){
      $('#render_html2markdown').click();
    } else {
      $('#render_remarked').click();
    }
}

function reset_options(){
  set_options(default_options);
  localStorage['copy_convert_to_markdown'] =  JSON.stringify(default_options)
}

function get_options(){
  var p
  
  try{ 
    p = JSON.parse( localStorage['copy_convert_to_markdown'])
    // Need to merge in any undefined/new properties from last release 
    // Meaning, if we add new features they may not have them in profile
    p = $.extend(true, {}, default_options, p)
  }catch(e){
    p = default_options 
  }    

  return p

}
