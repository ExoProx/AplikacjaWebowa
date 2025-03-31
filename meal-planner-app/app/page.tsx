import Link from "next/link";
import SubmitButton from "./components/SubmitButton";

const HomePage = () => {
  return (
    <div className="bg-gradient-to-r from-blue-300 via-blue-900 to-blue-300 text-white">
      {/* Sekcja Hero */}
      <div className="py-16 flex flex-col items-center justify-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
          Witaj na stronie do układania jadłospisów!
        </h1>
        <p className="mb-24 text-2xl md:text-xl text-center max-w-3xl">
          Planuj swoje posiłki, odkrywaj przepisy i dziel się swoimi jadłospisami z innymi.
        </p>
        <div className="flex gap-4">
          <Link href="/login" className="scale-150">
            <SubmitButton type="submit">Zaloguj się</SubmitButton>
          </Link>
        </div>
      </div>

      {/* Sekcja Funkcje */}
      <div className="py-12 px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
          Co oferuje nasza strona?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white text-blue-900 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Układanie jadłospisów</h3>
            <p>
              Twórz spersonalizowane plany posiłków, korzystając z bogatej bazy przepisów z API
              FatSecret.
            </p>
          </div>
          <div className="bg-white text-blue-900 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Przeglądanie przepisów</h3>
            <p>
              Odkrywaj tysiące przepisów i zapisuj swoje ulubione, by mieć je zawsze pod ręką.
            </p>
          </div>
          <div className="bg-white text-blue-900 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Udostępnianie i edycja</h3>
            <p>
              Dziel się swoimi jadłospisami z innymi, edytuj je lub usuwaj w dowolnym momencie.
            </p>
          </div>
        </div>
      </div>

      {/* Sekcja Call to Action */}
      <div className="py-16 px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Gotowy, by zacząć?
        </h2>
        <p className="mb-8 text-lg md:text-xl max-w-2xl mx-auto">
          Zarejestruj się i odkryj, jak łatwo możesz planować swoje posiłki i inspirować innych.
        </p>
        <Link href="/register">
          <SubmitButton type="submit">Zarejestruj się teraz</SubmitButton>
        </Link>
      </div>

      {/* Sekcja O nas */}
      <div className="py-12 px-4 md:px-8 bg-blue-800">
        <h2 className="text-4xl md:text-4xl font-bold text-center mb-8">O nas</h2>
        <p className="text-center max-w-3xl mx-auto text-lg">
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