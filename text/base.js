// #!/usr/bin/python
// import string
// import random
// import math

// MAGIC_SET_SIZE = 20.0   # if the extracted set is less, then random words will be included 
//                         # inverse-proportionally to how small the set is
// MAX_WORD_SIZE = 20
// BREAK_CHARS = '.!?'

// # ==================================================================   
// def generate_lesson(file, length=200, needed='', ignore='', focus=''):
//     """Random generation of text of given length from a corpus; find some good samples at http://www.gutenberg.org/

//     Hints on how to help the generator:
//         - do not use a lot of focus chars or combinations that are very rare (i.e. 'qw')
//         - use 'ignore' to help the generator skip some of the characters to find larger snipets of text 

//     file = name of corpus file
//     length = desired generated text length
//     needed = include only these characters; if not specified (include all letters, punctuation and digits)
//     ignore = if these characters are encountered, just ignore and move to next character
//     focus = try to find sequences where these characters are more frequent (all focus chars must appear in one snippet)

//     - if not enough choices are available, the function will partially generate random words which 
//     statistically fit the nature of the corpus, in terms of word length and char frequency
//     """
//     if not needed:
//         needed = string.letters + string.punctuation + string.digits

//     needed = set(needed)

//     needed_words = {}
//     wlen_hist = [0 for _ in range(0, MAX_WORD_SIZE)]
//     char_hist = {c: 0 for c in needed}

//     content = ''
//     with open(file) as f:
//         content = f.read()

//     needed_str = ''
//     spacing = True
//     word_len = 0
//     prev_c = ''
//     same_c_count = 0

//     for c in content:
//         if c == prev_c:
//             if same_c_count == 3:
//                 continue
//             same_c_count += 1
//         else:
//             prev_c = c
//             same_c_count = 0

//         if c.isspace():
//             if not spacing:
//                 #save the length in the histogram
//                 if word_len < MAX_WORD_SIZE:
//                     wlen_hist[word_len] += 1
            
//             if needed_str:
//                 can_break = spacing or (c in BREAK_CHARS)
//                 should_break = len(needed_str) > length or calc_focus_ratio(needed_str, focus) < 0.15
//                 if (len(needed_str) > length/5 and can_break) or should_break:
//                     weight_and_add(needed_words, needed_str, focus)
//                     needed_str = ''
//             spacing = True
//             word_len = 0
//             continue

//         if c in ignore:
//             continue

//         if c in char_hist:
//             char_hist[c] += 1

//         if needed_str or spacing:
//             needed_str = check_and_add(needed_words, needed_str, c, char_hist, spacing, focus)
//         spacing = False
//         word_len += 1

//     # prepare sets for random generation
//     needed_words = [(c, h) for c, h in needed_words.items()]
//     wlen_hist = list(enumerate(wlen_hist))
//     char_hist = [(c,math.log(h)) for c, h in char_hist.items() if h]

//     word_chance = min(1.0, len(needed_words)/MAGIC_SET_SIZE)

//     lesson = []
//     lesson_len = 0
//     while lesson_len < length:
//         if random.random() < word_chance:
//             next_string = weighted_choice(needed_words)
//         else:
//             # must generate a random word-like string
//             next_string = ""
//             wlen = weighted_choice(wlen_hist)
//             for _ in range(wlen):
//                 next_string += weighted_choice(char_hist)
//         lesson.append(next_string)
//         lesson_len += len(next_string)

//     return lesson

// # ==================================================================   
// def calc_focus_ratio(str, focus):
//     if not focus:
//         return 1

//     accumulated_ratio = 0
//     n = len(str) * 1.0
//     for c in focus:
//         if c not in str:
//             return 0
//         accumulated_ratio += str.count(c) / n
//     return accumulated_ratio / len(focus)

// def weight_and_add(set_words, str, focus):
//     if focus:
//         focus_ratio = calc_focus_ratio(str, focus)
//         if focus_ratio: 
//             set_words[str] = focus_ratio * len(str)
//     else:
//         set_words[str] = len(str)

// def check_and_add(set_words, str, c, set_chars, spacing, focus):
//     if c in set_chars:
//         if spacing and str:
//             str += " "
//         str += c
//     else:
//         while str and not c.isspace() and not c in string.punctuation:
//             c = str[-1]
//             str = str[:-1]
//         str = str.strip()
//         if str:
//             weight_and_add(set_words, str, focus)
//             str = ''
//     return str

// def weighted_choice(choices):
//    total = sum(w for c, w in choices)
//    r = random.uniform(0, total)
//    upto = 0
//    for c, w in choices:
//       if upto + w >= r:
//          return c
//       upto += w
//    assert False, "Shouldn't get here"



// if __name__ == "__main__":
//     filename, length, chars, ignore, focus = open('input.txt').read().split('\n')
//     res = generate_lesson(filename, length=int(length), needed=chars, ignore=ignore, focus=focus)
//     print '\n'.join(res)
//     open('output.txt', 'w').write('\n'.join(res))



