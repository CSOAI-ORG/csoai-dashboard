/**
 * Test script to verify exam questions API
 */

const API_URL = 'https://3000-int4655edak6pdidnaem3-22671848.us1.manus.computer';

async function testExamAPI() {
  console.log('🧪 Testing Exam API...\n');

  try {
    // Test 1: Fetch test questions
    console.log('1️⃣ Testing getTestQuestions for testId=1...');
    const inputJson = JSON.stringify({ json: { testId: 1 } });
    const response = await fetch(`${API_URL}/api/trpc/certification.getTestQuestions?input=${encodeURIComponent(inputJson)}`);
    
    if (!response.ok) {
      console.error(`❌ API returned status ${response.status}`);
      const text = await response.text();
      console.error('Response:', text);
      return;
    }

    const data = await response.json();
    console.log('✅ API Response received');
    console.log('Response structure:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
    
    if (data.result?.data?.json) {
      const { test, questions } = data.result.data.json;
      console.log('\n📊 Test Details:');
      console.log(`   - Test ID: ${test?.id}`);
      console.log(`   - Test Title: ${test?.title}`);
      console.log(`   - Questions Count: ${questions?.length || 0}`);
      
      if (questions && questions.length > 0) {
        console.log('\n📝 Sample Question:');
        console.log(`   - ID: ${questions[0].id}`);
        console.log(`   - Text: ${questions[0].questionText?.substring(0, 100)}...`);
        console.log(`   - Type: ${questions[0].questionType}`);
        console.log(`   - Options: ${JSON.stringify(questions[0].options)}`);
        console.log(`   - Difficulty: ${questions[0].difficulty}`);
      } else {
        console.error('❌ No questions returned!');
      }
    } else {
      console.error('❌ Unexpected response structure:', data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  }
}

testExamAPI();
