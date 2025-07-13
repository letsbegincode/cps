import { IConcept, ITestQuestion } from '../types';

/**
 * Maps new database structure to existing backend structure
 * This ensures backward compatibility while supporting the new format
 */
export const mapConceptData = (conceptData: any): Partial<IConcept> => {
    const mapped: Partial<IConcept> = {
        title: conceptData.title || conceptData.Concept || '',
        description: conceptData.description || '',
        level: conceptData.level || conceptData.Level,
        category: conceptData.category || conceptData.Category,
        conceptType: conceptData.conceptType || conceptData.Concept_Type,
        estLearningTimeHours: conceptData.estLearningTimeHours || conceptData.Est_Learning_Time_Hours,
        isFundamental: conceptData.isFundamental || conceptData.Is_Fundamental,
        learningResources: conceptData.learningResources || conceptData.Learning_Resources,
        relatedConcepts: conceptData.relatedConcepts || conceptData.Related_Concepts || [],
        prerequisites: conceptData.prerequisites || [],
        contentBlocks: conceptData.contentBlocks || [],
        complexity: conceptData.complexity || 3,
    };

    // Map Test_Questions to quiz format for backward compatibility
    if (conceptData.Test_Questions && conceptData.Test_Questions.length > 0) {
        mapped.quiz = conceptData.Test_Questions.map((q: ITestQuestion) => ({
            questionText: q.question,
            options: q.options,
            correctAnswerIndex: q.correct,
            explanation: q.explanation
        }));
    } else if (conceptData.quiz) {
        mapped.quiz = conceptData.quiz;
    }

    // Also store the new format for future use
    if (conceptData.Test_Questions) {
        mapped.Test_Questions = conceptData.Test_Questions;
    }

    return mapped;
};

/**
 * Converts existing quiz format to new Test_Questions format
 */
export const convertQuizToTestQuestions = (quiz: any[]): ITestQuestion[] => {
    return quiz.map((q, index) => ({
        id: index + 1,
        topic: 'General', // Default topic
        difficulty: 'Medium' as const, // Default difficulty
        question: q.questionText,
        options: q.options,
        correct: q.correctAnswerIndex,
        explanation: q.explanation || 'No explanation provided',
        tags: ['general']
    }));
};

/**
 * Gets quiz questions for a concept, preferring Test_Questions over old quiz format
 */
export const getQuizQuestions = (concept: IConcept): ITestQuestion[] => {
    if (concept.Test_Questions && concept.Test_Questions.length > 0) {
        return concept.Test_Questions;
    }
    
    // Fallback to old format
    if (concept.quiz && concept.quiz.length > 0) {
        return convertQuizToTestQuestions(concept.quiz);
    }
    
    return [];
}; 