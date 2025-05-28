"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Users, BookOpen, Sliders, Zap, ChevronDown, ChevronUp, Utensils, Search, Share2 } from "lucide-react";
import jedzenieImg from '../public/images/jedzenie.jpg'


const HomePage = () => {
  const poznajNasRef = useRef<HTMLDivElement | null>(null);
  const coOferujemyRef = useRef<HTMLDivElement | null>(null);
  const faqRef = useRef<HTMLDivElement | null>(null);
  const [liczbaKlientow, setLiczbaKlientow] = useState(0);
  const [liczbaPrzepisow, setLiczbaPrzepisow] = useState(0);
  const [otwartePytanie, setOtwartePytanie] = useState<number | null>(null);
  const [cytat, setCytat] = useState("");
  const [widoczneSekcje, setWidoczneSekcje] = useState({
    coOferujemy: false,
    dlaczegoWarto: false,
    faq: false,
    poznajNas: false,
  });

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

  useEffect(() => {
    const cytaty = [
      "Eat to live, don't live to eat. - Socrates",
      "Healthy food is an investment in yourself.",
      "There are no impossible things, only things we haven't tried yet. - Jordan Belfort",
      "Good food, good mood, good life.",
      "Food is not just fuel, it's an experience. - James Beard",
      "You are what you eat. - Ludwig Feuerbach",
      "Healthy food means a healthy mind. - Juvenal"
    ];

    setCytat(cytaty[Math.floor(Math.random() * cytaty.length)]);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === coOferujemyRef.current) {
              setWidoczneSekcje((prev) => ({ ...prev, coOferujemy: true }));
            } else if (entry.target === faqRef.current) {
              setWidoczneSekcje((prev) => ({ ...prev, faq: true }));
            } else if (entry.target === poznajNasRef.current) {
              setWidoczneSekcje((prev) => ({ ...prev, poznajNas: true }));
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    if (coOferujemyRef.current) observer.observe(coOferujemyRef.current);
    if (faqRef.current) observer.observe(faqRef.current);
    if (poznajNasRef.current) observer.observe(poznajNasRef.current);

    return () => observer.disconnect();
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
    { pytanie: "How to start using the app?", odpowiedz: "To start, register or log into your account. Then you can start browsing recipes and creating your own meal plans." },
    { pytanie: "Can I customize the meal plan to my needs?", odpowiedz: "Yes, our app allows you to personalize your meal plan based on your dietary preferences and goals." },
    { pytanie: "Is the app free?", odpowiedz: "The app offers both free and premium features. Details can be found in the 'What do we offer?' section." },
    { pytanie: "How can I share my meal plan?", odpowiedz: "You can share your meal plan by generating a shareable link or exporting it to a PDF." },
    { pytanie: "Can I edit an existing meal plan?", odpowiedz: "Yes, you can edit your meal plans at any time by adding, removing, or modifying meals." },
    { pytanie: "Are there vegetarian recipes?", odpowiedz: "Yes, our recipe base includes many options for vegetarians and vegans." },
    { pytanie: "How can I contact customer support?", odpowiedz: "You can contact us by sending an email to kontakt@naszaaplikacja.pl." },
    { pytanie: "Can I save favorite recipes?", odpowiedz: "Yes, you can add recipes to favorites to access them quickly." },
    { pytanie: "Does the app analyze nutritional values?", odpowiedz: "Yes, the app automatically calculates the nutritional value of your meal plans, including calories, macros, and vitamins." },
    { pytanie: "Can I use the app on mobile devices?", odpowiedz: "Yes, our app is responsive and works well on all mobile devices." },
  ];

  const otworzPytanie = (indeks: number) => {
    setOtwartePytanie(otwartePytanie === indeks ? null : indeks);
  };

  return (
  <div className="bg-gray-900 text-white relative">
    {/* Belka u góry */}
    <div className="absolute top-0 left-0 w-full z-20 bg-transparent py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
        <h1 className="text-2xl font-bold text-white">mniamPlan</h1>
        <div className="flex space-x-6">
          <Link href="/login" className="hover:text-gray-300">
            Log in
          </Link>
          <Link href="/register" className="hover:text-gray-300">
            Register
          </Link>
          <button onClick={scrollToPoznajNas} className="hover:text-gray-300">
            About Us
          </button>
          <button onClick={scrollToCoOferujemy} className="hover:text-gray-300">
            What We Offer?
          </button>
          <button onClick={scrollToFAQ} className="hover:text-gray-300">
            FAQ
          </button>
          <button onClick={scrollToPoznajNas} className="hover:text-gray-300">
            Contact
          </button>
        </div>
      </div>
    </div>

    {/* Zdjęcie */}
    <div className="relative h-screen flex items-center justify-center">
      <Image
        src={jedzenieImg}
        alt="Food background"
        layout="fill"
        objectFit="cover"
        className="opacity-50"
      />
      <div className="z-10 flex flex-col items-center">
        <h2 className="text-6xl md:text-6xl font-ozdobna text-center text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide py-5">
          Create your perfect meal plan with us
        </h2>
        <p className="text-lg md:text-2xl font-ozdobna text-center mt-4 pt-9">{cytat}</p>
      </div>
    </div>

    {/* Sekcja Co oferujemy */}
    <div ref={coOferujemyRef} className={`bg-gray-800 py-10 transition-opacity duration-1000 ${widoczneSekcje.coOferujemy ? "opacity-100" : "opacity-0"}`}>
      <h2 className="text-3xl font-bold text-center mb-8">What We Offer?</h2>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg transform transition-transform hover:scale-110 duration-300 cursor-pointer flex flex-col items-center">
          <Utensils size={48} className="mb-4" />
          <h3 className="text-xl font-semibold mb-4 text-center">Meal Planning</h3>
          <p className="text-center">
            Create personalized meal plans using our extensive recipe database.
          </p>
        </div>
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg transform transition-transform hover:scale-110 duration-300 flex flex-col items-center">
          <Search size={48} className="mb-4" />
          <h3 className="text-xl font-semibold mb-4 text-center">Browse Recipes</h3>
          <p className="text-center">
            Discover thousands of recipes and save your favorites for quick access.
          </p>
        </div>
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg transform transition-transform hover:scale-110 duration-300 flex flex-col items-center">
          <Share2 size={48} className="mb-4" />
          <h3 className="text-xl font-semibold mb-4 text-center">Sharing & Editing</h3>
          <p className="text-center">
            Share your meal plans with others, edit or remove them anytime.
          </p>
        </div>
      </div>
    </div>

    {/* Sekcja Dlaczego warto nas wybrać */}
    <div className="bg-gray-700 py-10 text-white">
      <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 px-6">
        {/* Zadowoleni klienci */}
        <div className="flex flex-col items-center text-center">
          <Users size={48} className="text-green-400 mb-4" />
          <div className="text-4xl font-bold">{liczbaKlientow}</div>
          <p>Satisfied Customers</p>
        </div>

        {/* Liczba przepisów */}
        <div className="flex flex-col items-center text-center">
          <BookOpen size={48} className="text-yellow-400 mb-4" />
          <div className="text-4xl font-bold">{liczbaPrzepisow}</div>
          <h3>Recipes</h3>
        </div>

        {/* Personalizacja */}
        <div className="flex flex-col items-center text-center">
          <Sliders size={48} className="text-blue-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Personalization</h3>
          <p>Adjust your meal plan to your needs and goals.</p>
        </div>

        {/* Szybkość */}
        <div className="flex flex-col items-center text-center">
          <Zap size={48} className="text-pink-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Speed</h3>
          <p>Create plans in seconds – no unnecessary steps.</p>
        </div>
      </div>
    </div>

    {/* Sekcja FAQ */}
    <div ref={faqRef} className={`bg-gray-800 py-10 transition-opacity duration-1000 ${widoczneSekcje.faq ? "opacity-100" : "opacity-0"}`}>
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
              <div className="py-2 px-4">
                <p>{pytanie.odpowiedz}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* Sekcja Poznaj nas */}
    <div ref={poznajNasRef} className={`bg-gray-800 py-10 transition-opacity duration-1000 ${widoczneSekcje.poznajNas ? "opacity-100" : "opacity-0"}`}>
      <h2 className="text-3xl font-bold text-center mb-8">Meet Us!</h2>
      <div className="py-1 px-4 md:px-8 bg-gray-800">
        <p className="text-center text-xl max-w-7xl mx-auto mb-2">
          We are a team of enthusiasts of healthy lifestyle and modern technologies.
          Our goal is to make diet planning easy with an intuitive app that combines
          functionality with simplicity. Join us and start taking care of your meals today!
        </p>
      </div>

      <div className="py-10 px-4 md:px-8 bg-gray-800">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {[
            { src: "/ewelina.jpg", name: "Ewelina", desc: "our UI master. She creates intuitive and beautiful app interfaces." },
            { src: "/przemek.jpg", name: "Przemysław", desc: "the backend king. He ensures our app runs strong behind the scenes." },
            { src: "/dawid.jpg", name: "Dawid", desc: "a creative front-end developer. His code brings our app to life." },
            { src: "/dominik.jpg", name: "Dominik", desc: "our reliable backend engineer. He provides solid foundations for our app." }
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
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                <p className="text-white text-sm px-2">{name} - {desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center">Our app is the result of our hard work and dedication.</p>
      </div>
    </div>

    {/* Belka Kontakt */}
    <div className="bg-gray-700 py-6 text-center">
      <h2 className="text-2xl font-bold mb-4">Contact</h2>
      <p>Address: ul. Wrocławska 12, 50-200 Wrocław</p>
      <p>Email: contact@mniamplan.org</p>
      <p>Phone: +48 123 456 789</p>
    </div>
  </div>
);
};

export default HomePage;