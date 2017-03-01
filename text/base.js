// #!/usr/bin/python
// import string
// import random
// import math

var MAGIC_SET_SIZE = 20.0;   // if the extracted set is less, then random words will be included 
                        	 // inverse-proportionally to how small the set is
var MAX_WORD_SIZE = 20;
var BREAK_CHARS = '.!?';

var lowercase = 'abcdefghijklmnopqrstuvwxyz',
	uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
	punctuation = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~',
	digits = '0123456789';
var letters = _.concat(lowercase, uppercase);

var corpora = {
	english: ['andersen-books'],
	french: ['andersen-french-1'],
	romanian: ['eminescu'],
	german: ['hans-german'],
	spanish: ['edgar-poe-spanish', 'manual-de-economia-politica']
}

window.onload = function() {
	var $corpora = $("#corpora");

	var file_list = [];
	for (var lang in corpora) {
		var file_list = _.concat(file_list, corpora[lang]);
	}
	for (var i in file_list) {
		$corpora.append("<option>" + file_list[i] + "</option>");
	}
}

function add_needed_lowercase() {$("#needed").val($("#needed").val() + lowercase);}
function add_needed_uppercase() {$("#needed").val($("#needed").val() + uppercase);}
function add_needed_digits() {$("#needed").val($("#needed").val() + digits);}
function add_needed_punctuation() {$("#needed").val($("#needed").val() + punctuation);}
function clear_needed() {$("#needed").val("");}
function add_ignored_lowercase() {$("#ignore").val($("#ignore").val() + lowercase);}
function add_ignored_uppercase() {$("#ignore").val($("#ignore").val() + uppercase);}
function add_ignored_digits() {$("#ignore").val($("#ignore").val() + digits);}
function add_ignored_punctuation() {$("#ignore").val($("#ignore").val() + punctuation);}
function clear_ignored() {$("#ignore").val("");}

// ==================================================================   
function generate_lesson(corpus, length=200, needed, ignore='', focus='') {
    /* Random generation of text of given length from a corpus; find some good samples at http://www.gutenberg.org/

    Hints on how to help the generator:
        - do not use a lot of focus chars or combinations that are very rare (i.e. 'qw')
        - use 'ignore' to help the generator skip some of the characters to find larger snipets of text 

    file = name of corpus file
    length = desired generated text length
    needed = include only these characters; if not specified (include all letters, punctuation and digits)
    ignore = if these characters are encountered, just ignore and move to next character
    focus = try to find sequences where these characters are more frequent (all focus chars must appear in one snippet)

    - if not enough choices are available, the function will partially generate random words which 
    statistically fit the nature of the corpus, in terms of word length and char frequency
    */

    if (!needed) needed = letters + punctuation + digits;
    needed = needed + $("#extended").val().trim();

    needed = new Set(needed);

    needed_words = {};
    wlen_hist = _.fill(new Array(MAX_WORD_SIZE), 0);

    var char_hist = {};
    for (var c of needed) char_hist[c] = 0;

    // no need to keep track of the new line characters
	// console.log(corpus.split("\n")[2]);

//     with open(file) as f:
//         content = f.read()

	var needed_str = '', spacing = true, word_len = 0, prev_c = '', same_c_count = 0;

	log_progress("<i>Loading corpus...</i>");

    for (var i in corpus) {
    	var c = corpus[i];

        if (c == prev_c) {
            if (same_c_count == 3) continue;
            same_c_count++;
        } else {
            prev_c = c
            same_c_count = 0
        }
        if (/\s/.test(c)) {
        	if (!spacing) {
        		// save the length in the histogram
                if (word_len < MAX_WORD_SIZE) wlen_hist[word_len]++;
        	}
			if (needed_str) {
				can_break = spacing || (BREAK_CHARS.indexOf(c)>=0);
				should_break = (needed_str.length > length) || (calc_focus_ratio(needed_str, focus) < 0.15);
				if ((needed_str > length/5 && can_break) || should_break) {
					weight_and_add(needed_words, needed_str, focus);
					needed_str = '';
				}
			}            
            spacing = true;
            word_len = 0;
            continue;
		}

        if (ignore.indexOf(c) >= 0) continue;

        if (c in char_hist) char_hist[c]++;

        if (needed_str || spacing) 
        	needed_str = check_and_add(needed_words, needed_str, c , char_hist, spacing, focus)

        spacing = false;
        word_len++;
	}

    // prepare sets for random generation
    needed_words = _.toPairs(needed_words);
    wlen_hist = _.toPairs(wlen_hist); // pair each item with its index

    char_hist_list = [];
    for (var c in char_hist) char_hist_list.push([c, Math.log(char_hist[c])]);
    char_hist = char_hist_list;

	word_chance = Math.min(1, needed_words.length/MAGIC_SET_SIZE);

	var lesson = [], lesson_len = 0;

	function keepGenerating() {
		if (lesson_len >= length) {
			log_progress("<ul>" + lesson.map(function(text) {
				return "<li>" + text + "</li>";
			}).join("") + "</ul>");
			$("#result-size").html(lesson_len);
			return
		}
		if (Math.random() < word_chance) next_string = weighted_choice(needed_words);
		else {
			// must generate a random word-like string
			next_string = "";
			wlen = weighted_choice(wlen_hist);
			for (var i in _.range(wlen)) next_string += weighted_choice(char_hist);
		}
		lesson.push(next_string);
		lesson_len += next_string.length;
		log_progress("<i>Generating text ..." + lesson_len + "/" + length + "</i>");;
		setTimeout(keepGenerating);
	}
	setTimeout(keepGenerating);
}

function log_progress(log) {
	$("#result").html(log);
}

// # ==================================================================   
function calc_focus_ratio(str, focus) {
	if (!focus) return 1;

	var accumulated_ratio = 0, n = str.length;

	for (var i in focus) {
		var c = focus[i];
		if (str.indexOf(c)<0) return 0;
		accumulated_ratio += str.split(c).length - 1; //count the c's in str
	}
	return accumulated_ratio / focus.length;
}

function weight_and_add(set_words, str, focus) {
	if (focus) {
		focus_ratio = calc_focus_ratio(str, focus);
		if (focus_ratio) set_words[str] = focus_ratio * str.length;
	} else {
		set_words[str] = str.length;
	}
}

function check_and_add(set_words, str, c, set_chars, spacing, focus) {
	if (c in set_chars) {
		if (spacing && str.length) str += " ";
		str += c
	} else {
		while (str.length && !/\s/.test(c) && punctuation.indexOf(c) < 0) {
			c = str[str.length - 1];
			str = str.substr(0, str.length - 1);
		}
		str = str.trim();
		if (str.length > 0) {
			weight_and_add(set_words, str, focus);
			str = "";
		}
	}
	return str;
}

function weighted_choice(choices) {
	var total = 0;
	for (var i in choices) total += choices[i][1];
	var r = Math.random() * total;
	var upto = 0;
	for (i in choices) {
		var w = choices[i][1];
		if (upto + w >= r) return choices[i][0];
		upto += w;
	}
	throw("Should't get here");
}

var loaded_file;
var $content;

function generate() {
	var file = "corpora/" + $("#corpora").val();

	function onCorpusLoaded() {
		loaded_file = file;

		var length = parseInt($("#length").val()),
			needed = $("#needed").val(), 
			ignore = $("#ignore").val(), 
			focus = $("#focus").val();

		if (isNaN(length)) length = 200;
		generate_lesson($content.text(), length, needed, ignore, focus);
	}

	if (loaded_file != file) {
		$content = $("<div/>");	
	    $content.load(file, onCorpusLoaded);
	} else onCorpusLoaded();
}

// if __name__ == "__main__":
//     filename, length, chars, ignore, focus = open('input.txt').read().split('\n')
//     res = generate_lesson(filename, length=int(length), needed=chars, ignore=ignore, focus=focus)
//     print '\n'.join(res)
//     open('output.txt', 'w').write('\n'.join(res))



