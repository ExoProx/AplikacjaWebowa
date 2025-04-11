"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Users, BookOpen, Sliders, Zap, ChevronDown, ChevronUp, Utensils, Search, Share2 } from "lucide-react";



const HomePage = () => {
  const [liczbaKlientow, setLiczbaKlientow] = useState(0);
  const [liczbaPrzepisow, setLiczbaPrzepisow] = useState(0);
  const poznajNasRef = useRef(null);
  const coOferujemyRef = useRef(null);
  const faqRef = useRef(null);
  const [otwartePytanie, setOtwartePytanie] = useState(null);


  useEffect(() => {
    let klientTimer: NodeJS.Timeout;
    let przepisTimer: NodeJS.Timeout;

    if (liczbaKlientow < 956) {
      klientTimer = setInterval(() => {
        setLiczbaKlientow((prev) => {
          if (prev < 956) return prev + 10;
          clearInterval(klientTimer);
          return prev;
        });
      }, 1);
    }

    if (liczbaPrzepisow < 3000) {
      przepisTimer = setInterval(() => {
        setLiczbaPrzepisow((prev) => {
          if (prev < 3000) return prev + 10;
          clearInterval(przepisTimer);
          return prev;
        });
      }, 1);
    }

    return () => {
      clearInterval(klientTimer);
      clearInterval(przepisTimer);
    };
  }, []);

  const scrollToPoznajNas = () => {
    poznajNasRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToCoOferujemy = () => {
    coOferujemyRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToFAQ = () => {
    faqRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const pytania = [
    { pytanie: "Jak zacząć korzystać z aplikacji?", odpowiedz: "Aby rozpocząć, zarejestruj się lub zaloguj na swoje konto. Następnie możesz zacząć przeglądać przepisy i tworzyć własne jadłospisy." },
    { pytanie: "Czy mogę dostosować jadłospis do swoich potrzeb?", odpowiedz: "Tak, nasza aplikacja umożliwia personalizację jadłospisu, uwzględniając Twoje preferencje żywieniowe i cele dietetyczne." },
    { pytanie: "Czy aplikacja jest płatna?", odpowiedz: "Aplikacja oferuje zarówno darmowe, jak i płatne funkcje premium. Szczegóły znajdziesz w sekcji 'Co oferujemy?'." },
    { pytanie: "Jak mogę udostępnić swój jadłospis?", odpowiedz: "Możesz udostępnić swój jadłospis, generując link do udostępnienia lub eksportując go do pliku PDF." },
    { pytanie: "Czy mogę edytować istniejący jadłospis?", odpowiedz: "Tak, w każdej chwili możesz edytować swoje jadłospisy, dodając, usuwając lub modyfikując posiłki." },
    { pytanie: "Czy aplikacja oferuje przepisy dla wegetarian?", odpowiedz: "Tak, w naszej bazie przepisów znajdziesz wiele opcji dla wegetarian i wegan." },
    { pytanie: "Jak mogę skontaktować się z obsługą klienta?", odpowiedz: "Możesz skontaktować się z nami, wysyłając wiadomość e-mail na adres kontakt@naszaaplikacja.pl lub korzystając z formularza kontaktowego na stronie." },
    { pytanie: "Czy mogę zapisywać ulubione przepisy?", odpowiedz: "Tak, możesz dodawać przepisy do ulubionych, aby mieć do nich szybki dostęp." },
    { pytanie: "Czy aplikacja analizuje wartość odżywczą jadłospisów?", odpowiedz: "Tak, aplikacja automatycznie oblicza wartość odżywczą Twoich jadłospisów, dostarczając szczegółowych informacji o kaloriach, makroskładnikach i witaminach." },
    { pytanie: "Czy mogę korzystać z aplikacji na urządzeniach mobilnych?", odpowiedz: "Tak, nasza aplikacja jest responsywna i działa poprawnie na wszystkich urządzeniach mobilnych." },
  ];

  const otworzPytanie = (indeks) => {
    setOtwartePytanie(otwartePytanie === indeks ? null : indeks);
  };

  const cytaty = [
    "Jedz, aby żyć, nie żyj, aby jeść. - Sokrates",
    "Zdrowe jedzenie to inwestycja w siebie.",
    "Nie ma rzeczy niemożliwych, są tylko rzeczy, których jeszcze nie próbowaliśmy. - Jordan Belfort",
    "Dobre jedzenie, dobry nastrój, dobre życie.",
    "Jedzenie to nie tylko paliwo, to doświadczenie. - James Beard",
    "Człowiek jest tym, co je. - Ludwig Feuerbach",
    "Zdrowe jedzenie to zdrowy umysł. - Juvenal"
  ];

  const [cytat, setCytat] = useState(""); 

  useEffect(() => {
    setCytat(cytaty[Math.floor(Math.random() * cytaty.length)]);
  }, []);

  return (
    <div className="bg-gray-900 text-white relative">
      {/* Belka u góry -, przyciski po prawej */}
      <div className="bg-gray-800 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
          <h1 className="text-xl font-bold text-white">Nasza Aplikacja</h1>
          <div className="flex space-x-6">
            <Link href="/login" className="hover:text-gray-300">
              Zaloguj się
            </Link>
            <Link href="/register" className="hover:text-gray-300">
              Zarejestruj się
            </Link>
            <Link href="/recipes" className="hover:text-gray-300">
              Przepisy
            </Link>
            <button onClick={scrollToPoznajNas} className="hover:text-gray-300">
              O nas
            </button>
            <button onClick={scrollToCoOferujemy} className="hover:text-gray-300">
              Co oferujemy?
            </button>
            <button onClick={scrollToFAQ} className="hover:text-gray-300">
              FAQ
            </button>
            <button onClick={scrollToPoznajNas} className="hover:text-gray-300">
              Kontakt
            </button>
          </div>
        </div>
      </div>



      {/* Zdjęcie z napisem */}
      <div className="relative h-screen flex items-center justify-center">
                <Image
                    src="/jedzenie.jpg"
                    alt="Tło z jedzeniem"
                    layout="fill"
                    objectFit="cover"
                    className="opacity-50"
                />
                <div className="z-10 flex flex-col items-center">
                    <h2 className="text-6xl md:text-6xl font-ozdobna text-center text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide py-5">
                        Stwórz z nami swój idealny jadłospis
                    </h2>
                    <p className="text-lg md:text-2xl font-ozdobna text-center mt-4 pt-9">{cytat}</p>
                </div>
            </div>

                 {/* Sekcja Co oferujemy */}
                <div ref={coOferujemyRef} className="bg-gray-800 py-10">
                <h2 className="text-3xl font-bold text-center mb-8">Co oferujemy?</h2>
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-gray-700 p-6 rounded-lg shadow-lg transform transition-transform hover:scale-110 duration-300 cursor-pointer flex flex-col items-center">
                        <Utensils size={48} className="mb-4" />
                        <h3 className="text-xl font-semibold mb-4 text-center">Układanie jadłospisów</h3>
                        <p className="text-center">
                            Twórz spersonalizowane plany posiłków, korzystając z bogatej bazy przepisów.
                        </p>
                    </div>
                    <div className="bg-gray-700 p-6 rounded-lg shadow-lg transform transition-transform hover:scale-110 duration-300 flex flex-col items-center">
                        <Search size={48} className="mb-4" />
                        <h3 className="text-xl font-semibold mb-4 text-center">Przeglądanie przepisów</h3>
                        <p className="text-center">
                            Odkrywaj tysiące przepisów i zapisuj swoje ulubione, by mieć je zawsze pod ręką.
                        </p>
                    </div>
                    <div className="bg-gray-700 p-6 rounded-lg shadow-lg transform transition-transform hover:scale-110 duration-300 flex flex-col items-center">
                        <Share2 size={48} className="mb-4" />
                        <h3 className="text-xl font-semibold mb-4 text-center">Udostępnianie i edycja</h3>
                        <p className="text-center">
                            Dziel się swoimi jadłospisami z innymi, edytuj je lub usuwaj w dowolnym momencie.
                        </p>
                    </div>
                </div>
            </div>

      {/* Sekcja Dlaczego warto nas wybrać */}
      <div className="bg-gray-700 py-10 text-white">
        <h2 className="text-3xl font-bold text-center mb-12">Dlaczego warto nas wybrać?</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 px-6">
          {/* Zadowoleni klienci */}
          <div className="flex flex-col items-center text-center">
            <Users size={48} className="text-green-400 mb-4" />
            <div className="text-4xl font-bold">{liczbaKlientow}</div>
            <p>Zadowolonych klientów</p>
          </div>

          {/* Liczba przepisów */}
          <div className="flex flex-col items-center text-center">
            <BookOpen size={48} className="text-yellow-400 mb-4" />
            <div className="text-4xl font-bold">{liczbaPrzepisow}</div>
            <p>Przepisów</p>
          </div>

          {/* Personalizacja */}
          <div className="flex flex-col items-center text-center">
            <Sliders size={48} className="text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Personalizacja</h3>
            <p>Dostosuj jadłospis do swoich potrzeb i celów.</p>
          </div>

          {/* Szybkość */}
          <div className="flex flex-col items-center text-center">
            <Zap size={48} className="text-pink-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Szybkość</h3>
            <p>Twórz plany w kilka sekund – bez zbędnych kroków.</p>
          </div>
        </div>
      </div>

      {/* Sekcja FAQ */}
      <div ref={faqRef} className="bg-gray-800 py-10">
        <h2 className="text-3xl font-bold text-center mb-8">FAQ</h2>
        <div className="max-w-3xl mx-auto">
          {pytania.map((pytanie, indeks) => (
            <div key={indeks} className="border-b border-gray-700">
              <button
                className="flex justify-between w-full py-4 text-left"
                onClick={() => otworzPytanie(indeks)}
              >
                <span className="font-semibold">{pytanie.pytanie}</span>
                {otwartePytanie === indeks ? <ChevronUp /> : <ChevronDown />}
              </button>
              {otwartePytanie === indeks && (
                <div className="py-2 px-4"> {/* Usunięto bg-gray-700 */}
                  <p>{pytanie.odpowiedz}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sekcja Poznaj nas */}
      <div ref={poznajNasRef} className="bg-gray-700 py-10">
        <h2 className="text-3xl font-bold text-center mb-8">Poznaj nas</h2>
        <div className="py-1 px-4 md:px-8 bg-gray-700">
          <p className="text-center text-xl max-w-7xl mx-auto mb-2">
            Jesteśmy zespołem entuzjastów zdrowego stylu życia i nowoczesnych technologii. Naszym
            celem jest ułatwienie Ci planowania diety dzięki intuicyjnej aplikacji, która łączy 
            funkcjonalność z prostotą obsługi. Dołącz do nas i zacznij dbać o swoje posiłki już
            dzisiaj!
          </p>
        </div>

        <div className="py-10 px-4 md:px-8 bg-gray-800">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Nasz Zespół</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { src: "/ewelina.jpg", name: "Ewelina", desc: "nasza mistrzyni interfejsu. Tworzy dla Was intuicyjne i piękne strony aplikacji." },
              { src: "/przemek.jpg", name: "Przemysław", desc: "król backendu. Zapewnia stabilność i moc naszej aplikacji od kuchni." },
              { src: "/Dawid.jpg", name: "Dawid", desc: "kreatywny front-endowiec. Jego kod ożywia naszą aplikację." },
              { src: "/dominik.jpg", name: "Dominik", desc: "nasz niezawodny back-endowiec. Zapewnia solidne fundamenty naszej aplikacji." }
            ].map(({ src, name, desc }, i) => (
              <div key={i} className="text-center relative group">
                <Image
                  src={src}
                  alt={name}
                  width={200}
                  height={200}
                  className="rounded-lg mx-auto mb-4 transition-opacity duration-300 group-hover:opacity-50"
                />
                <h3 className="text-lg font-semibold absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white">
                  {name}
                </h3>
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                  <p className="text-white text-sm px-2">{name} - {desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center">Nasza aplikacja to owoc naszej ciężkiej pracy i zaangażowania.</p>
        </div>
      </div>

      {/* Belka Kontakt */}
      <div className="bg-gray-700 py-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Kontakt</h2>
        <p>Adres: ul. Wrocławska 12, 50-200 Wrocław</p>
        <p>Email: kontakt@naszaaplikacja.pl</p>
        <p>Telefon: +48 123 456 789</p>
      </div>
    </div>
  );
};

export default HomePage;