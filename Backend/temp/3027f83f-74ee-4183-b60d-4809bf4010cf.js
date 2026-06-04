
// Write your solution here
function solution() {
  console.log("hii")
}


(function() {
  let args = [];
  try {
    const inputStr = "{   \"sentence\": \"I love coding\" }";
    const parsed = JSON.parse(inputStr.trim());
    args = Array.isArray(parsed) ? parsed : [parsed];
  } catch (e) {
    args = ["{   \"sentence\": \"I love coding\" }"];
  }

  try {
    
    if (typeof function findLongestWord(sentence) !== 'function') {
      throw new Error("Function 'function findLongestWord(sentence)' is not defined in your code");
    }
    const result = function findLongestWord(sentence)(...args);
    console.log("\n##RESULT##" + JSON.stringify({
      success: true,
      result: result
    }));
    
  } catch (err) {
    console.log("\n##RESULT##" + JSON.stringify({
      success: false,
      error: err.message || String(err),
      stack: err.stack
    }));
  }
})();
