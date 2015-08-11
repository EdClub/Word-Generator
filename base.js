var neg_words = ["polio", "mm", "hookup", "junky", "kink", "hokum", "hullo", "pinko", "plonk", "kip", "drug", "violent", "so-called", "mm-hmm", "catholic", "butt", "nazi", "damn", "fund-raising", "gi", "prostitution", "buddhist", "best-known", "hebrew", "hepatitis", "vulgar", "ex-husband", "queer"];


$(function(){
  $(".word_list").change(get_count_of_selected);
  $("#custom").keydown(get_count_of_selected);
  $("#custom").change(get_count_of_selected);
});

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var master_list = {};
function load_word_lists(){
  var filenames = _.map($(".word_list"), function(x){ return $(x).data('filename'); })

  $(filenames).each(function(i, name){
    $.get(name, function(text){
      master_list[name] = text.split('\n');
      $(".word_list").filter(function() {return $(this).data("filename") == name }).parent().append($("<i />").html('<span class="label label-default">'+numberWithCommas(master_list[name].length)+'</span>'));
      get_count_of_selected();
    });
  });
}

function get_count_of_selected(){
  var word_list_names = _.map($(".word_list:checked"), function(x){ return $(x).data('filename'); });
  var lst = tokenize($("#custom").val());
  $(word_list_names).each(function(i, name){
    lst = lst.concat(master_list[name]);
  });

  $("#count").html($("<span />").addClass('label label-primary  ').html(numberWithCommas(lst.length)));
}

function tokenize(string){
  return _.remove(string.replace(/,/g, '\n').split('\n'), function(n){return n.trim()!='';});
}

function get_form_data(){
  var data = {};

  data.include = _.map($("#include").val().split(','), function(x){ return x.trim(); });
  data.tolerate = $("#tolerate").val().trim().split('');
  data.from_count = parseInt($("#from_count").val());
  data.to_count = parseInt($("#to_count").val());
  
  var word_list_names = _.map($(".word_list:checked"), function(x){ return $(x).data('filename'); });
  var lst = tokenize($("#custom").val());
  $(word_list_names).each(function(i, name){
    lst = lst.concat(master_list[name]);
  });
  data.word_list = lst;

  return data;
}

function is_word_match(word, query){
  var len = word.length;
  word = word.toLowerCase();
  var chars = word.split('');

  if(len < query.from_count)
    return false;
  
  if(len > query.to_count)
    return false;

  if(_.indexOf(neg_words, word) != -1)
    return false;

  var trimmed_down = word;
  for(var i=0;i<query.include.length;i++){
    var str = query.include[i];

    // address the must haves
    if(word.search(new RegExp(str, 'g')) == -1)
      return false;

    trimmed_down = trimmed_down.replace(new RegExp(str, 'g'), '')
  }

  if(query.tolerate.length && query.tolerate[0] == '*')
    return true;

  var left_over_chars = trimmed_down.split('');
  if(_.difference(left_over_chars, query.tolerate).length)
    return false;

  return true;
}

function generate_words(query){
  var word_list = query.word_list;
  var new_list = [];
  for(var i=0;i<word_list.length;i++){
    var word = word_list[i];
    if(is_word_match(word, query))
      new_list.push(word);
  }
  return new_list;
}

$(function(){
  load_word_lists();
  $("#gen").click(function(){
    var query = get_form_data();
    var words = generate_words(query);
    $("#result").val(words.join('\n'));
    return false;
  });  
})
