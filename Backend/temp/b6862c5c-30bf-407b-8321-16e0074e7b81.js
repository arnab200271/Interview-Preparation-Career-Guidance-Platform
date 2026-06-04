
// Write your solution here
function solution() {
  console.log("hi")
}


(function() {
  let args = [];
  try {
    const inputStr = "{   \"nums\": [2,7,11,15],   \"target\": 9 }";
    const parsed = JSON.parse(inputStr.trim());
    args = Array.isArray(parsed) ? parsed : [parsed];
  } catch (e) {
    args = ["{   \"nums\": [2,7,11,15],   \"target\": 9 }"];
  }

  try {
    
    if (typeof twoSum !== 'function') {
      throw new Error("Function 'twoSum' is not defined in your code");
    }
    const result = twoSum(...args);
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
