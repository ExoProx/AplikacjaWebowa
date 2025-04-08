import Link from "next/link";
import SubmitButton from "./components/SubmitButton";

const HomePage = () => {
  return (
    <div className="bg-gradient-to-r from-green-100 via-green-200 to-green-100 text-black">
      {/* Sekcja Hero */}
      <div className="py-2 mb-2 flex flex-col items-center justify-center bg-emerald-300">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center">
          Witaj na stronie mniamPlan!
        </h1>
        <p className="mb-2 text-2xl md:text-xl text-center max-w-4xl">
          Planuj swoje posiłki, odkrywaj przepisy i dziel się swoimi jadłospisami z innymi.
        </p>
      </div>
    
      {/* Sekcja przycisków Logowania i Rejestracji */}
      <div className="py-10 px-4 md:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 text-center text-blue-900">
          <div className="p-6 rounded-lg shadow-md bg-white transform transition-transform hover:scale-110 duration-300">
            <h3 className="text-xl font-semibold mb-2">Masz już konto?</h3>
            <p className="mb-4">
              Zaloguj się, aby zarządzać swoimi jadłospisami!
            </p>
            <Link href="/login" className="text-white">
              <SubmitButton type="submit">Zaloguj się</SubmitButton>
            </Link>
          </div>
          <div className="p-6 rounded-lg shadow-md bg-white transform transition-transform hover:scale-110 duration-300">
            <h3 className="text-xl font-semibold mb-2">
              Nie masz konta?
            </h3>
            <p className="mb-4">
              Zarejestruj się teraz i zacznij planować swoje posiłki!
            </p>
            <Link href="/register" className="text-white">
              <SubmitButton type="submit">Zarejestruj się</SubmitButton>
            </Link>
          </div>
        </div>
      </div>
      {/* Sekcja Funkcje */}
      <div className="py-1 px-4 md:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3.5">
          Co oferujemy?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-full mx-auto text-center mb-10">
          <div className="bg-white text-blue-900 p-6 rounded-lg shadow-lg transform transition-transform hover:scale-110 duration-300 cursor-pointer">
            <h3 className="text-xl font-semibold mb-4">Układanie jadłospisów</h3>
            <p>
              Twórz spersonalizowane plany posiłków, korzystając z bogatej bazy przepisów.
            </p>
          </div>
          <div className="bg-white text-blue-900 p-6 rounded-lg shadow-lg transform transition-transform hover:scale-110 duration-300">
            <h3 className="text-xl font-semibold mb-4">Przeglądanie przepisów</h3>
            <p>
              Odkrywaj tysiące przepisów i zapisuj swoje ulubione, by mieć je zawsze pod ręką.
            </p>
          </div>
          <div className="bg-white text-blue-900 p-6 rounded-lg shadow-lg transform transition-transform hover:scale-110 duration-300">
            <h3 className="text-xl font-semibold mb-4">Udostępnianie i edycja</h3>
            <p>
              Dziel się swoimi jadłospisami z innymi, edytuj je lub usuwaj w dowolnym momencie.
            </p>
          </div>
        </div>
      </div>

      {/* Sekcja O nas */}
      <div className="py-1 px-4 md:px-8 bg-emerald-300">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">O nas</h2>
        <p className="text-center text-xl md:text-xl max-w-7xl mx-auto mb-2">
          Jesteśmy zespołem entuzjastów zdrowego stylu życia i nowoczesnych technologii. Naszym
          celem jest ułatwienie Ci planowania diety dzięki intuicyjnej aplikacji, która łączy
          funkcjonalność z prostotą obsługi. Dołącz do nas i zacznij dbać o swoje posiłki już
          dzisiaj!
        </p>
      </div>
    </div>
  );
};

export default HomePage;
