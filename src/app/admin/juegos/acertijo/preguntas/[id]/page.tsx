import { getQuestion } from "@/app/actions/juegos"
import { redirect } from "next/navigation"
import { QuestionForm } from "../QuestionForm"

export default async function EditPreguntaPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const question = await getQuestion(params.id)
  
  if (!question) {
    redirect("/admin/juegos/acertijo/preguntas")
  }

  return <QuestionForm question={question} isEditing />
}
