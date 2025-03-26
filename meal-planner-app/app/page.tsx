import Link from "next/link";
import SubmitButton from "./components/SubmitButton";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-300 via-blue-900 to-blue-300 text-white">
      <h1 className="text-4xl font-bold mb-6">Witaj w aplikacji!</h1>
      <p className="mb-4">Wybierz jedną z opcji:</p>
      <div className="flex gap-4">
        <Link href="/login">
          <SubmitButton type="submit" className="px-4 py-2 bg-blue-500 hover:bg-blue-700 rounded text-white">
            Zaloguj się
          </SubmitButton>
        </Link>
        
        <Link href="/register">
          <SubmitButton type="submit" className="px-4 py-2 bg-green-500 hover:bg-green-700 rounded text-white">
            Zarejestruj się
          </SubmitButton>
        </Link>
        
      </div>
    </div>
  );
};

export default HomePage;