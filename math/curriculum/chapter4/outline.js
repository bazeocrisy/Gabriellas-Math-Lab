/* NumberNova Chapter 4 textbook-aligned curriculum map.
 * Original instructional examples; no textbook exercises reproduced.
 * This metadata does not register unfinished lessons as playable.
 */
(function (G) {
  'use strict';
  const lessons = [
    {id:'4-1',page:101,title:'Estimate Sums and Differences of Decimals',skills:['rounding','reasonableness'],
      goal:'Use rounding or compatible numbers to estimate decimal sums and differences.',
      teach:['Choose the place value needed for a useful estimate.','Round both numbers to the same place value.','Add or subtract rounded numbers and compare your estimate to the exact result.'],
      model:{a:'12.48',b:'7.31',operation:'+',estimate:'12 + 7 = 19',exact:'19.79'},
      misconception:'An estimate is not required to match the exact answer.'},
    {id:'4-2',page:107,title:'Represent Addition of Decimals',skills:['decimal-grids','place-value'],
      goal:'Represent addition using tenths and hundredths on decimal grids.',
      teach:['Each full 10-by-10 grid represents one whole.','One column is one tenth; one small square is one hundredth.','Combine shaded parts, exchanging 100 hundredths for one whole if needed.'],
      model:{a:'0.42',b:'0.35',operation:'+',estimate:'42 hundredths + 35 hundredths',exact:'0.77'},
      misconception:'A tenth covers ten hundredths, not one hundredth.'},
    {id:'4-3',page:111,title:'Represent Addition of Tenths and Hundredths',skills:['regrouping','decimal-grids'],
      goal:'Add tenths and hundredths using place-value models, including exchanging.',
      teach:['Rename tenths as hundredths if helpful.','Combine like units before exchanging.','When hundredths total 100 or more, exchange for one whole.'],
      model:{a:'0.7',b:'0.46',operation:'+',estimate:'70 hundredths + 46 hundredths',exact:'1.16'},
      misconception:'A sum greater than one requires a whole in the model.'},
    {id:'4-4',page:115,title:'Strategies to Add Decimals',skills:['decomposition','standard-algorithm','compensation'],
      goal:'Add decimals accurately using place value, decomposing, or compensation.',
      teach:['Align decimal points so like places line up.','Add hundredths, tenths, then whole numbers; regroup when needed.','Check by decomposing or estimating.'],
      model:{a:'3.68',b:'2.47',operation:'+',estimate:'3 + 2 + 0.6 + 0.4 + 0.08 + 0.07',exact:'6.15'},
      misconception:'Never line up numbers by their rightmost digit when decimal places differ.'},
    {id:'4-5',page:119,title:'Represent Subtraction of Decimals',skills:['decimal-grids','subtraction'],
      goal:'Use shaded decimal models to remove parts and find a difference.',
      teach:['Represent the starting amount first.','Remove the amount being subtracted.','Count the unshaded or remaining amount, keeping place value consistent.'],
      model:{a:'0.85',b:'0.32',operation:'−',estimate:'85 hundredths − 32 hundredths',exact:'0.53'},
      misconception:'Model the minuend before taking away the subtrahend.'},
    {id:'4-6',page:123,title:'Represent Subtraction of Tenths and Hundredths',skills:['regrouping','number-line'],
      goal:'Subtract tenths and hundredths with regrouping and visual models.',
      teach:['Rename a tenth as ten hundredths to subtract when necessary.','Use grids or count backward on a number line.','Check by adding the difference to the amount subtracted.'],
      model:{a:'1.23',b:'0.58',operation:'−',estimate:'123 hundredths − 58 hundredths',exact:'0.65'},
      misconception:'Regrouping changes the unit counts, not the value.'},
    {id:'4-7',page:127,title:'Strategies to Subtract Decimals',skills:['decomposition','standard-algorithm','compensation'],
      goal:'Use place-value subtraction, decomposition, and compensation.',
      teach:['Write equivalent decimals with the same number of decimal places.','Regroup across whole, tenths, and hundredths as needed.','Estimate or add back to verify the difference.'],
      model:{a:'6.2',b:'2.86',operation:'−',estimate:'6.20 − 2.86',exact:'3.34'},
      misconception:'Writing 6.2 as 6.20 does not change its value.'},
    {id:'4-8',page:131,title:'Explain Strategies to Add and Subtract Decimals',skills:['reasoning','word-problems','strategy-selection'],
      goal:'Choose an efficient strategy and explain why it works.',
      teach:['Decide whether the situation requires adding or subtracting.','Select a model, algorithm, decomposition, or compensation.','State what each quantity represents and check the result.'],
      model:{a:'4.75',b:'1.25',operation:'+',estimate:'Make a whole: 0.75 + 1.25 = 2',exact:'6.00'},
      misconception:'A correct number without a matching explanation is incomplete reasoning.'}
  ];
  G.chapter4Curriculum = Object.freeze({
    title:'Chapter 4 — Add and Subtract Decimals',
    lessons: lessons.map(l => Object.freeze(l)),
    reviewPage:135,
    fluencyPage:139,
    masteryCorrect:9,
    lessonTestLength:10,
    practiceLength:10,
    independentLength:10,
    finalTestLength:25
  });
})(window.GML = window.GML || {});
