const fs = require('fs');

// File paths
const coursesFile = './test.courses.updated.json';
const conceptsFile = './test.concepts.json';
const outputFile = './test.courses.updated.withtitles.json';

// Read and parse files
const courses = JSON.parse(fs.readFileSync(coursesFile, 'utf-8'));
const concepts = JSON.parse(fs.readFileSync(conceptsFile, 'utf-8'));

// Build a map: _id.$oid -> { conceptId, title }
const idToConcept = {};
concepts.forEach(c => {
  const id = c._id && c._id.$oid;
  if (id) {
    idToConcept[id] = {
      conceptId: id, // Always use the unique ObjectId as the conceptId
      title: c.title || 'Untitled'
    };
  }
});

// For each course, replace conceptIds with concepts [{conceptId, title}]
courses.forEach(course => {
  if (Array.isArray(course.conceptIds)) {
    course.concepts = course.conceptIds.map(id => {
      // id is a string, match to _id.$oid
      return idToConcept[id] || { conceptId: id, title: 'Unknown' };
    });
    delete course.conceptIds; // Remove the old array if you want
  }
});

// Write the updated courses to a new file
fs.writeFileSync(outputFile, JSON.stringify(courses, null, 2));
console.log(`✅ Updated courses written to ${outputFile}`);