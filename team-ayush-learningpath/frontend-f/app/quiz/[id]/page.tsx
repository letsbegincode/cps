"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Clock, CheckCircle, XCircle, Trophy, Target, ArrowRight, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import DSAQuizEngine from '@/components/DSAQuizEngine'

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: "Easy" | "Medium" | "Hard"
  topic: string
}

const sampleQuestions: Question[] = [
  {
    id: 1,
    question: "What is the time complexity of searching in a balanced binary search tree?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: 1,
    explanation: "In a balanced BST, the height is log n, so search operations take O(log n) time.",
    difficulty: "Medium",
    topic: "Data Structures",
  },
  {
    id: 2,
    question: "Which sorting algorithm has the best average-case time complexity?",
    options: ["Bubble Sort", "Quick Sort", "Insertion Sort", "Selection Sort"],
    correctAnswer: 1,
    explanation:
      "Quick Sort has an average-case time complexity of O(n log n), which is optimal for comparison-based sorting.",
    difficulty: "Medium",
    topic: "Algorithms",
  },
  {
    id: 3,
    question: "What data structure is used to implement recursion?",
    options: ["Queue", "Stack", "Array", "Linked List"],
    correctAnswer: 1,
    explanation: "Recursion uses the call stack to keep track of function calls and their local variables.",
    difficulty: "Easy",
    topic: "Data Structures",
  },
  {
    id: 4,
    question: "Which of the following is NOT a stable sorting algorithm?",
    options: ["Merge Sort", "Quick Sort", "Insertion Sort", "Bubble Sort"],
    correctAnswer: 1,
    explanation:
      "Quick Sort is not stable because it can change the relative order of equal elements during partitioning.",
    difficulty: "Hard",
    topic: "Algorithms",
  },
  {
    id: 5,
    question: "What is the space complexity of the merge sort algorithm?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    correctAnswer: 2,
    explanation: "Merge Sort requires O(n) additional space for the temporary arrays used during merging.",
    difficulty: "Medium",
    topic: "Algorithms",
  },
]

export default function QuizPage({ params }: { params: { id: string } }) {
  return <DSAQuizEngine conceptId={params.id} />;
}
