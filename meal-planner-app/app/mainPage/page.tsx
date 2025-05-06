// app/mainPage/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import MainPage from './MainPage'

export default async function Page() {
  const cookieStore = await cookies()
  //const token = cookieStore.get('token')?.value

  //if (!token) {
   // redirect('/login')
 // }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: 'url("/jedzenie.jpg")',
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <MainPage />
    </div>
  )
}