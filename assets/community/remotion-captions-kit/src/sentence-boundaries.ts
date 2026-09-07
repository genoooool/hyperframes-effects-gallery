/**
 * Does this word end a sentence?
 *
 * "Ends in a period" is not the question. Captions are full of periods that
 * sit mid-sentence — titles ("Dr."), acronyms ("U.S."), list numbers ("3.")
 * — and breaking on those is worse than missing a real break: a missed
 * break leaves a slightly long page, a false one leaves a 200ms page
 * reading "Dr." on its own.
 *
 * So the test has three parts: the word has to *look* like an ender, it
 * must not be a word that never ends a sentence, and for the genuinely
 * ambiguous ones the following word has to look like a fresh start.
 */

/** A terminator, then any number of closing quotes or brackets. */
const SENTENCE_END = /[.!?…]+[)\]}"'”’»›]*$/u;

/** Opening quote or bracket, at the head of a word. */
const SENTENCE_START = /^[("'“‘«‹]*[\p{Lu}\p{N}]/u;

/**
 * Words that never end a sentence. Titles are the important ones: they are
 * always followed by a capitalised name, so no amount of looking ahead
 * saves us — they have to be listed.
 *
 * Deliberately absent: "No.". As an abbreviation for "number" it belongs
 * here, but no speech recogniser writes it that way — it transcribes as
 * "number five". Spoken, "No." is the word, and it ends sentences all day.
 */
const NEVER_ENDS = new Set([
	'mr',
	'mrs',
	'ms',
	'mx',
	'dr',
	'prof',
	'rev',
	'hon',
	'sr',
	'jr',
	'st',
	'mt',
	'ft',
	'capt',
	'sgt',
	'lt',
	'col',
	'gen',
	'gov',
	'sen',
	'rep',
	'vs',
	'cf',
	'viz',
	'eg',
	'ie',
	'vol',
	'fig',
	'figs',
	'pp',
	'ca',
	'approx',
	'dept',
	'est',
	'univ',
	'apt',
	'ste',
	'ave',
	'blvd',
	'rd',
]);

/**
 * Words that usually sit mid-sentence but can legitimately end one
 * ("...and so on, etc." / "...based in the U.S."). For these, the next
 * word decides.
 */
const MAYBE_ENDS = new Set([
	'etc',
	'al',
	'inc',
	'ltd',
	'co',
	'corp',
	'llc',
	'am',
	'pm',
	'ed',
	'eds',
	'esp',
	'min',
	'max',
	'sec',
	'ref',
	'jan',
	'feb',
	'mar',
	'apr',
	'jun',
	'jul',
	'aug',
	'sep',
	'sept',
	'oct',
	'nov',
	'dec',
]);

/** "U.S.", "e.g.", "a.m.", "Ph.D." — dotted acronyms. */
const DOTTED_ACRONYM = /^(?:\p{L}{1,2}\.){2,}$/u;

/**
 * "J." — a lone initial, as in "J. R. R. Tolkien". Treated as never ending
 * a sentence, because the next word is capitalised either way and the two
 * readings can't be told apart. Getting it wrong the other way puts a page
 * on screen holding a single letter, which is far more visibly broken than
 * a page that runs a few words long.
 */
const SINGLE_INITIAL = /^\p{L}\.$/u;

/** "3." — a list number, not the end of anything. */
const BARE_NUMBER = /^\p{N}+\.$/u;

/** Strip closing quotes/brackets and any terminators to get at the word. */
const stem = (word: string): string =>
	word
		.replace(/[)\]}"'”’»›]+$/u, '')
		.replace(/[.!?…]+$/u, '')
		.toLowerCase();

/**
 * True when `word` ends a sentence. `nextWord` is the word that follows,
 * or undefined at the end of the input (where a terminator always counts).
 */
export const endsSentence = (word: string, nextWord?: string): boolean => {
	const trimmed = word.trim();

	if (!SENTENCE_END.test(trimmed)) {
		return false;
	}

	// "!" and "?" are never abbreviation markers, so they always break.
	if (/[!?…]/u.test(trimmed)) {
		return true;
	}

	const bare = stem(trimmed);

	if (NEVER_ENDS.has(bare) || SINGLE_INITIAL.test(trimmed)) {
		return false;
	}

	const ambiguous =
		MAYBE_ENDS.has(bare) ||
		DOTTED_ACRONYM.test(trimmed) ||
		BARE_NUMBER.test(trimmed);

	if (!ambiguous) {
		return true;
	}

	// Last word of the input: a terminator is all we have to go on.
	if (nextWord === undefined) {
		return true;
	}

	return SENTENCE_START.test(nextWord.trim());
};

/**
 * Clause-level punctuation — a comma, semicolon, colon or dash. Not a page
 * break on its own, but a better place to break than mid-phrase when the
 * duration or character cap forces one.
 */
const CLAUSE_END = /[,;:—–-]["'”’]?$/u;

export const endsClause = (word: string): boolean =>
	CLAUSE_END.test(word.trim());
