const https = require('https');
const fs = require('fs');

// Coaching keywords for extraction
const coachingKeywords = [
  'padel', 'coaching', 'allenamento', 'formazione', 'nutrizione', 'fitness',
  'esercizio', 'workout', 'training', 'performance', 'tecnica', 'strategia',
  'simone pagnottoni', 'simopagno', 'coach', 'istruttore'
];

// Function to fetch webpage content
function fetchWebpage(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    };
    
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Function to extract text content from HTML
function extractTextContent(html) {
  // Remove script and style tags
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Remove HTML tags but keep some structure
  text = text.replace(/<h[1-6][^>]*>/gi, '\n### ');
  text = text.replace(/<\/h[1-6]>/gi, '\n');
  text = text.replace(/<p[^>]*>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n');
  text = text.replace(/<br[^>]*>/gi, '\n');
  text = text.replace(/<[^>]*>/g, ' ');
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  text = text.replace(/\n\s*\n/g, '\n');
  
  return text;
}

// Function to extract meta information
function extractMetaInfo(html) {
  const meta = {};
  
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) meta.title = titleMatch[1];
  
  // Extract description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  if (descMatch) meta.description = descMatch[1];
  
  // Extract keywords
  const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
  if (keywordsMatch) meta.keywords = keywordsMatch[1];
  
  return meta;
}

// Function to extract coaching-related content
function extractCoachingContent(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const coachingSentences = sentences.filter(sentence => 
    coachingKeywords.some(keyword => 
      sentence.toLowerCase().includes(keyword.toLowerCase())
    )
  );
  
  return coachingSentences;
}

// Main analysis function
async function analyzeWebsite() {
  try {
    console.log('Analyzing simonepagnottoni.it...');
    
    // Fetch main page
    const mainPage = await fetchWebpage('https://www.simonepagnottoni.it');
    const mainContent = extractTextContent(mainPage);
    const metaInfo = extractMetaInfo(mainPage);
    const coachingContent = extractCoachingContent(mainContent);
    
    // Save the extracted content
    const analysisData = {
      timestamp: new Date().toISOString(),
      website: 'https://www.simonepagnottoni.it',
      metaInfo,
      mainPage: {
        content: mainContent,
        length: mainContent.length,
        coachingSentences: coachingContent
      },
      coachingInfo: {
        name: 'Simone Pagnottoni',
        brand: 'Simopagno Coaching',
        services: ['Padel', 'Coaching', 'Formazione', 'Nutrizione', 'Allenamento'],
        socialMedia: {
          facebook: 'https://www.facebook.com/simopagnocoaching',
          instagram: 'https://www.instagram.com/simopagnocoaching/',
          youtube: 'https://www.youtube.com/channel/UC5xM0gHfD8KxwtKQ29d40wQ'
        }
      },
      chatbotTrainingData: {
        coachingStyle: 'Professional, motivational, technique-focused',
        expertise: ['Padel coaching', 'Fitness training', 'Nutrition guidance', 'Performance optimization'],
        commonTopics: coachingContent.slice(0, 20), // First 20 coaching-related sentences
        terminology: coachingKeywords
      }
    };
    
    fs.writeFileSync('simonepagnottoni-analysis.json', JSON.stringify(analysisData, null, 2));
    
    console.log('Analysis completed!');
    console.log('Title:', metaInfo.title);
    console.log('Description:', metaInfo.description);
    console.log('Content length:', mainContent.length);
    console.log('Coaching sentences found:', coachingContent.length);
    console.log('Preview of coaching content:');
    coachingContent.slice(0, 5).forEach((sentence, index) => {
      console.log(`${index + 1}. ${sentence.trim()}`);
    });
    
    return analysisData;
    
  } catch (error) {
    console.error('Error analyzing website:', error);
    return null;
  }
}

// Run the analysis
analyzeWebsite(); 