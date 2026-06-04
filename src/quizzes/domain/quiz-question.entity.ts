export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  choices: string[];
  correctChoice: number;
  grade: number;
  orderIndex: number;
}
