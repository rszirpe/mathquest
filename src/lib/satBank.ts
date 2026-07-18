import type { AnswerValue } from '@/types'

export type SatBand = 'younger' | '3' | '4' | '5'

export interface SatBankEntry {
  id: string
  band: SatBand
  prompt: string
  choices: AnswerValue[]
  answer: AnswerValue
}

/**
 * Originally-authored, SAT-style questions closely modeled on real released SAT items'
 * structure, topics, and difficulty — scaled down to the grade band being taught. Written and
 * curated by hand (not procedurally generated) to avoid the copyright risk of republishing
 * College Board's own content on a public site.
 */
export const SAT_BANK: SatBankEntry[] = [
  // ---- Younger (K-2) ----
  { id: 'y1', band: 'younger', prompt: 'A garden has 3 rows of flowers with 4 flowers in each row. How many flowers are there in all?', choices: [7, 10, 12, 16], answer: 12 },
  { id: 'y2', band: 'younger', prompt: 'Sam has 15 stickers. He gives 6 to a friend and then buys 3 more. How many stickers does Sam have now?', choices: [9, 12, 18, 21], answer: 12 },
  { id: 'y3', band: 'younger', prompt: 'What number is missing from the pattern? 2, 4, 6, ▢, 10', choices: [7, 8, 9, 12], answer: 8 },
  { id: 'y4', band: 'younger', prompt: 'A box holds 5 pencils. How many pencils are in 4 boxes?', choices: [9, 15, 20, 25], answer: 20 },
  { id: 'y5', band: 'younger', prompt: 'Maria read 8 pages on Monday and 7 pages on Tuesday. How many pages did she read in all?', choices: [1, 14, 15, 16], answer: 15 },
  { id: 'y6', band: 'younger', prompt: 'There are 18 apples shared equally between 3 baskets. How many apples are in each basket?', choices: [3, 6, 9, 15], answer: 6 },
  { id: 'y7', band: 'younger', prompt: 'Which shape has exactly 4 equal sides?', choices: ['triangle', 'square', 'circle', 'rectangle'], answer: 'square' },
  { id: 'y8', band: 'younger', prompt: 'A ribbon that is 14 inches long is cut into 2 equal pieces. How long is each piece?', choices: [2, 6, 7, 12], answer: 7 },

  // ---- Grade 3 ----
  { id: 'g3-1', band: '3', prompt: 'A baker makes 6 trays of muffins with 8 muffins on each tray. How many muffins does the baker make in all?', choices: [14, 42, 48, 56], answer: 48 },
  { id: 'g3-2', band: '3', prompt: 'Team A scored 24 points. Team B scored 3 times as many points as Team A. How many points did Team B score?', choices: [8, 21, 27, 72], answer: 72 },
  { id: 'g3-3', band: '3', prompt: 'A rectangular garden is 6 feet long and 4 feet wide. What is its area, in square feet?', choices: [10, 20, 24, 28], answer: 24 },
  { id: 'g3-4', band: '3', prompt: 'There are 32 crayons in a box, shared equally among 4 kids. How many crayons does each kid get?', choices: [6, 7, 8, 9], answer: 8 },
  { id: 'g3-5', band: '3', prompt: 'Round 456 to the nearest hundred.', choices: [400, 450, 460, 500], answer: 500 },
  { id: 'g3-6', band: '3', prompt: 'A pizza is cut into 8 equal slices. Jake eats 3 slices. What fraction of the pizza is left?', choices: ['1/2', '2/8', '3/8', '5/8'], answer: '5/8' },
  { id: 'g3-7', band: '3', prompt: 'A number pattern increases by 6 each time: 5, 11, 17, 23, ▢. What is the next number?', choices: [26, 28, 29, 35], answer: 29 },
  { id: 'g3-8', band: '3', prompt: 'A farmer has 45 eggs and puts 6 eggs in each carton. How many full cartons can he fill?', choices: [6, 7, 8, 9], answer: 7 },

  // ---- Grade 4 ----
  { id: 'g4-1', band: '4', prompt: 'A school orders 24 boxes of paper with 18 reams in each box. How many reams did the school order in total?', choices: [332, 412, 432, 442], answer: 432 },
  { id: 'g4-2', band: '4', prompt: 'Which fraction is equivalent to 2/3?', choices: ['1/3', '2/6', '3/4', '4/6'], answer: '4/6' },
  { id: 'g4-3', band: '4', prompt: 'A recipe needs 3/4 cup of sugar per batch. How much sugar, in cups, is needed for 3 batches?', choices: ['3/4', '6/4', '9/4', '12/4'], answer: '9/4' },
  { id: 'g4-4', band: '4', prompt: 'What is 3.25 + 1.6?', choices: [4.75, 4.85, 4.95, 5.85], answer: 4.85 },
  { id: 'g4-5', band: '4', prompt: 'Which number is a factor of 36 but not a factor of 24?', choices: [4, 8, 9, 24], answer: 9 },
  { id: 'g4-6', band: '4', prompt: 'A theater has 28 rows with 24 seats in each row. How many seats are there in all?', choices: [552, 652, 672, 772], answer: 672 },
  { id: 'g4-7', band: '4', prompt: 'Round 3,482 to the nearest thousand.', choices: [3000, 3400, 3500, 4000], answer: 3000 },
  { id: 'g4-8', band: '4', prompt: 'A number is a multiple of both 4 and 6. Which of these could it be?', choices: [8, 9, 12, 16], answer: 12 },

  // ---- Grade 5 ----
  { id: 'g5-1', band: '5', prompt: 'What is 2/3 × 3/4?', choices: ['1/2', '2/7', '3/4', '5/12'], answer: '1/2' },
  { id: 'g5-2', band: '5', prompt: 'Using the order of operations, what is 6 + 4 × 3?', choices: [13, 18, 21, 30], answer: 18 },
  { id: 'g5-3', band: '5', prompt: 'A rectangular prism has length 5 cm, width 3 cm, and height 4 cm. What is its volume?', choices: [12, 47, 60, 75], answer: 60 },
  { id: 'g5-4', band: '5', prompt: 'What is 5.6 − 2.75?', choices: [2.75, 2.85, 2.95, 3.15], answer: 2.85 },
  { id: 'g5-5', band: '5', prompt: 'Point A is at (2, 3) on a coordinate grid. If it moves 3 units right and 4 units up, what are its new coordinates?', choices: ['(2, 7)', '(5, 3)', '(5, 7)', '(6, 8)'], answer: '(5, 7)' },
  { id: 'g5-6', band: '5', prompt: 'What is the average (mean) of 12, 18, and 24?', choices: [16, 17, 18, 20], answer: 18 },
  { id: 'g5-7', band: '5', prompt: 'A number cubed equals 125. What is the number?', choices: [4, 5, 15, 25], answer: 5 },
  { id: 'g5-8', band: '5', prompt: 'Simplify: 3/4 + 1/8', choices: ['1/2', '4/12', '5/8', '7/8'], answer: '7/8' },
]
