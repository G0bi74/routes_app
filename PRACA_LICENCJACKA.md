# Aplikacja mobilna wspomagająca rejestrowanie podróży służbowych

## PLAN PRACY

### WSTĘP
Wprowadzenie do problematyki ewidencjonowania podróży służbowych w kontekście obowiązków prawnych i organizacyjnych przedsiębiorstw. Przedstawienie celu pracy, którym jest zaprojektowanie i implementacja aplikacji mobilnej automatyzującej proces rejestrowania tras. Krótka charakterystyka struktury pracy z uzasadnieniem kolejności rozdziałów.

### ROZDZIAŁ 1. Analiza problemu i założenia projektowe
- Charakterystyka problemu ewidencji podróży służbowych w przedsiębiorstwach
- Analiza istniejących rozwiązań na rynku
- Wymagania funkcjonalne aplikacji
- Wymagania niefunkcjonalne
- Założenia projektowe i ograniczenia

### ROZDZIAŁ 2. Wykorzystane technologie
- Framework React Native i platforma Expo
- Firebase (Authentication, Firestore, Cloud Storage)
- Usługi geolokalizacyjne (expo-location, OpenRouteService)
- Technologia OCR (OCR.space)
- System powiadomień
- Biblioteki pomocnicze

### ROZDZIAŁ 3. Architektura i struktura aplikacji
- Architektura wielowarstwowa aplikacji
- Struktura katalogów projektu
- Wzorce projektowe
- Przepływ danych w aplikacji
- Model danych w bazie Firestore
- Mechanizmy bezpieczeństwa

### ROZDZIAŁ 4. Interfejs użytkownika i funkcjonalności
- Nawigacja w aplikacji
- Moduł autoryzacji
- Moduł tworzenia tras
- Moduł historii i szczegółów tras
- Moduł profilu użytkownika
- Generowanie raportów PDF
- Wsparcie dla motywów kolorystycznych

### PODSUMOWANIE
Przypomnienie celu pracy, ewaluacja rozwiązań, ograniczenia, kierunki dalszego rozwoju.

---

## WSTĘP

Współczesne przedsiębiorstwa funkcjonują w środowisku charakteryzującym się wysokim stopniem mobilności pracowników oraz złożonością procesów administracyjnych związanych z rozliczaniem delegacji i podróży służbowych. Obowiązujące przepisy prawa, w szczególności regulacje podatkowe oraz zasady rozliczania kosztów uzyskania przychodu, nakładają na podmioty gospodarcze wymóg prowadzenia szczegółowej dokumentacji przejazdów wykonywanych w celach służbowych. Tradycyjne metody ewidencjonowania tras, oparte na papierowych formularzach lub prostych arkuszach kalkulacyjnych, okazują się niewystarczające wobec rosnących wymagań dotyczących dokładności, terminowości i weryfikowalności wprowadzanych danych.

Problematyka rzetelnego dokumentowania podróży służbowych nabiera szczególnego znaczenia w kontekście wykorzystywania pojazdów prywatnych do celów służbowych, gdzie prawidłowe określenie przejechanego dystansu stanowi podstawę do obliczenia należnego pracownikowi zwrotu kosztów. Manualne prowadzenie ewidencji wiąże się z ryzykiem błędów wynikających z niedokładności odczytów licznika, opóźnień w rejestrowaniu tras czy też niekompletności wprowadzanych informacji. Dodatkowo brak możliwości automatycznej weryfikacji deklarowanych przebiegów utrudnia kontrolę wewnętrzną i może generować nieprawidłowości w rozliczeniach.

Dynamiczny rozwój technologii mobilnych oraz powszechna dostępność smartfonów wyposażonych w odbiorniki GPS otworzyły nowe możliwości w zakresie automatyzacji procesów ewidencyjnych. Urządzenia te dysponują również aparatami fotograficznymi wysokiej rozdzielczości oraz dostępem do usług chmurowych, co umożliwia implementację zaawansowanych funkcjonalności wykraczających poza możliwości tradycyjnych metod dokumentacji. W tym kontekście naturalne staje się pytanie o możliwość wykorzystania potencjału współczesnych technologii mobilnych do usprawnienia procesu rejestrowania podróży służbowych.

Celem niniejszej pracy jest zaprojektowanie oraz implementacja aplikacji mobilnej wspomagającej rejestrowanie podróży służbowych, która poprzez automatyzację kluczowych czynności zminimalizuje nakład pracy użytkownika przy jednoczesnym zwiększeniu dokładności i wiarygodności gromadzonych danych. Aplikacja ma umożliwiać automatyczne pobieranie lokalizacji geograficznej z wykorzystaniem systemu GPS, rozpoznawanie stanu licznika pojazdu na podstawie fotografii przy użyciu technologii optycznego rozpoznawania znaków oraz obliczanie rzeczywistego dystansu trasy z uwzględnieniem siatki drogowej. Dodatkowo system powinien zapewniać bezpieczne przechowywanie danych w infrastrukturze chmurowej oraz generowanie raportów w formacie umożliwiającym dalsze przetwarzanie lub archiwizację.

Realizacja tak zdefiniowanego celu wymagała rozwiązania szeregu problemów technicznych związanych z integracją heterogenicznych usług i interfejsów programistycznych. Konieczny był dobór odpowiedniego stosu technologicznego zapewniającego wieloplatformowość rozwiązania, wybór usług backendowych gwarantujących skalowalność i bezpieczeństwo, a także implementacja algorytmów przetwarzania danych geograficznych i obrazowych. Proces projektowania i implementacji aplikacji stanowi praktyczną ilustrację współczesnych metodyk wytwarzania oprogramowania mobilnego.

Struktura pracy odzwierciedla logiczny przebieg procesu projektowego, prowadząc czytelnika od analizy problemu, przez uzasadnienie wyborów technologicznych, aż po prezentację gotowego rozwiązania. Pierwszy rozdział poświęcony jest charakterystyce problemu ewidencji podróży służbowych oraz analizie wymagań funkcjonalnych i niefunkcjonalnych projektowanej aplikacji. Zidentyfikowane wymagania stanowią punkt wyjścia dla rozważań zawartych w rozdziale drugim, w którym przedstawiono wykorzystane technologie wraz z uzasadnieniem ich wyboru w kontekście specyfiki rozwiązywanego problemu. Rozdział trzeci prezentuje architekturę i strukturę aplikacji, wyjaśniając sposób integracji poszczególnych komponentów w spójną całość oraz omawiając zastosowane wzorce projektowe. Czwarty rozdział stanowi prezentację interfejsu użytkownika i funkcjonalności aplikacji z perspektywy użytkownika końcowego, demonstrując jak przyjęte rozwiązania techniczne i architektoniczne przekładają się na konkretne możliwości systemu. Pracę zamyka podsumowanie zawierające ewaluację zrealizowanych celów, identyfikację ograniczeń obecnej implementacji oraz propozycje kierunków dalszego rozwoju aplikacji.

---

## ROZDZIAŁ 1. Analiza problemu i założenia projektowe

### 1.1. Charakterystyka problemu ewidencji podróży służbowych

Ewidencjonowanie podróży służbowych stanowi jeden z istotnych elementów zarządzania operacyjnego w przedsiębiorstwach, którego znaczenie wykracza dalece poza wymiar czysto administracyjny. Obowiązek prowadzenia dokumentacji przejazdów wynika zarówno z przepisów prawa podatkowego, jak i z wewnętrznych regulacji organizacyjnych mających na celu kontrolę kosztów oraz racjonalizację wykorzystania zasobów transportowych. W przypadku wykorzystywania pojazdów prywatnych do celów służbowych, rzetelna ewidencja stanowi podstawę do naliczenia należnego pracownikowi zwrotu kosztów, obliczanego najczęściej jako iloczyn przejechanej odległości oraz ustalonej stawki kilometrowej.

Tradycyjne podejście do dokumentowania podróży służbowych opiera się na formularzach papierowych lub elektronicznych arkuszach kalkulacyjnych, w których pracownik odnotowuje datę przejazdu, cel podróży, adres początkowy i docelowy, stan licznika na początku i końcu trasy oraz obliczony dystans. Metoda ta, choć koncepcyjnie prosta, obarczona jest szeregiem ograniczeń wynikających z jej manualnego charakteru. Przede wszystkim wymaga ona od użytkownika systematyczności w prowadzeniu zapisów, co w praktyce często skutkuje opóźnieniami i retrospektywnym uzupełnianiem ewidencji na podstawie niepełnych wspomnień. Ponadto ręczne odczytywanie i przepisywanie wartości z licznika pojazdu generuje ryzyko błędów, zarówno przypadkowych pomyłek, jak i celowych manipulacji.

Kolejnym istotnym problemem jest trudność weryfikacji deklarowanych przebiegów. Pracodawca dysponujący jedynie raportem tekstowym nie ma możliwości potwierdzenia, czy podana trasa faktycznie została pokonana oraz czy zadeklarowany dystans odpowiada rzeczywistości. Sytuacja ta komplikuje się dodatkowo w przypadku pracowników wykonujących liczne krótkie przejazdy w ciągu dnia roboczego, gdzie kumulacja drobnych nieścisłości może prowadzić do znaczących rozbieżności w skali miesiąca. Brak mechanizmów automatycznej walidacji sprawia, że proces kontroli wewnętrznej staje się czasochłonny i w praktyce często ogranicza się do wyrywkowego sprawdzania wiarygodności wybranych wpisów.

Z perspektywy pracownika manualne prowadzenie ewidencji stanowi uciążliwy obowiązek administracyjny odciągający uwagę od zasadniczych zadań zawodowych. Konieczność pamiętania o odnotowaniu każdego przejazdu, zapisywania stanów licznika przed i po podróży oraz późniejszego przenoszenia danych do systemu raportowego generuje dodatkowe obciążenie czasowe i poznawcze. W rezultacie część pracowników traktuje ten obowiązek jako formalistyczny wymóg, prowadząc ewidencję w sposób pobieżny lub uzupełniając ją zbiorczo pod koniec okresu rozliczeniowego, co nieuchronnie prowadzi do utraty dokładności i wiarygodności danych.

### 1.2. Analiza istniejących rozwiązań

Rynek aplikacji mobilnych oferuje szereg rozwiązań adresujących problem ewidencji podróży służbowych, jednak analiza dostępnych produktów ujawnia znaczące zróżnicowanie pod względem zakresu funkcjonalności oraz przyjętych założeń projektowych. Część aplikacji koncentruje się na automatycznym śledzeniu trasy z wykorzystaniem odbiornika GPS, rejestrując przebytą drogę w sposób ciągły i obliczając dystans na podstawie zapisanych współrzędnych geograficznych. Rozwiązania te eliminują konieczność manualnego wprowadzania adresów, jednak wymagają ciągłego działania aplikacji w tle, co wiąże się ze zwiększonym zużyciem baterii urządzenia oraz potencjalnymi problemami z prywatnością użytkownika.

Alternatywne podejście reprezentują aplikacje umożliwiające wprowadzanie tras w sposób deklaratywny, gdzie użytkownik podaje adresy początkowy i docelowy, a system oblicza dystans z wykorzystaniem zewnętrznych usług nawigacyjnych. Metoda ta charakteryzuje się mniejszym obciążeniem zasobów urządzenia, jednak nie zapewnia dowodu faktycznego wykonania przejazdu i opiera się wyłącznie na zaufaniu do deklaracji użytkownika. Niektóre rozwiązania oferują możliwość dołączania fotografii jako dokumentacji trasy, jednak rzadko kiedy implementują automatyczne przetwarzanie zawartości zdjęć.

Istotną luką zidentyfikowaną w dostępnych rozwiązaniach jest brak integracji funkcjonalności rozpoznawania tekstu ze zdjęć z procesem rejestrowania tras. Automatyczne odczytywanie stanu licznika pojazdu na podstawie fotografii deski rozdzielczej mogłoby znacząco uprościć proces wprowadzania danych i jednocześnie dostarczyć dokumentację fotograficzną potwierdzającą zadeklarowany przebieg. Połączenie tej funkcjonalności z automatycznym pobieraniem lokalizacji GPS stworzyłoby system oferujący zarówno wygodę użytkowania, jak i wiarygodność gromadzonych danych.

Dodatkowym aspektem różnicującym dostępne rozwiązania jest model przechowywania danych. Aplikacje operujące wyłącznie na lokalnej pamięci urządzenia narażają użytkownika na utratę danych w przypadku awarii lub zmiany telefonu, podczas gdy rozwiązania chmurowe zapewniają trwałość i dostępność danych z wielu urządzeń, jednak rodzą pytania dotyczące prywatności i bezpieczeństwa informacji przechowywanych na serwerach zewnętrznych. Wybór odpowiedniego modelu wymaga zbalansowania tych przeciwstawnych wymagań z uwzględnieniem specyfiki grupy docelowej użytkowników.

### 1.3. Wymagania funkcjonalne

Analiza problemu oraz przegląd istniejących rozwiązań pozwoliły na sformułowanie zestawu wymagań funkcjonalnych, które projektowana aplikacja powinna spełniać. Fundamentalnym wymaganiem jest zapewnienie możliwości rejestrowania podróży służbowych w dwóch trybach odpowiadających różnym scenariuszom użycia. Pierwszy tryb, określany jako tryb GPS lub tryb na żywo, zakłada rozpoczęcie rejestracji bezpośrednio przed wyruszeniem w trasę i zakończenie jej po dotarciu do celu. W tym trybie aplikacja automatycznie pobiera lokalizację geograficzną urządzenia, dokonuje konwersji współrzędnych na adresy tekstowe oraz oblicza dystans trasy. Drugi tryb, nazywany trybem manualnym, umożliwia retrospektywne wprowadzanie tras na podstawie adresów podanych przez użytkownika, co jest przydatne w sytuacjach, gdy użytkownik nie miał możliwości uruchomienia aplikacji przed wyjazdem.

Kolejnym istotnym wymaganiem jest integracja funkcjonalności rozpoznawania tekstu ze zdjęć umożliwiająca automatyczne odczytywanie stanu licznika pojazdu. Użytkownik wykonuje fotografię deski rozdzielczej z widocznym licznikiem, a aplikacja ekstrahuje wartość przebiegu i proponuje jej wykorzystanie w rejestrowanej trasie. Funkcjonalność ta powinna działać zarówno na początku, jak i na końcu trasy, umożliwiając obliczenie przejechanego dystansu jako różnicy stanów licznika. Jednocześnie zdjęcia licznika powinny być przechowywane jako dokumentacja fotograficzna, która może służyć celom kontrolnym lub dowodowym.

Aplikacja powinna zapewniać funkcjonalność uwierzytelniania użytkowników, umożliwiając tworzenie indywidualnych kont oraz bezpieczne logowanie. Mechanizm ten jest niezbędny do zapewnienia separacji danych pomiędzy użytkownikami oraz umożliwienia dostępu do historii tras z różnych urządzeń. Powiązanym wymaganiem jest przechowywanie danych w infrastrukturze chmurowej, gwarantujące trwałość informacji niezależnie od losu urządzenia mobilnego oraz synchronizację w czasie rzeczywistym.

Istotną funkcjonalnością z perspektywy rozliczeniowej jest możliwość generowania raportów zbiorczych za wybrany okres, najczęściej za tydzień lub miesiąc. Raporty powinny być generowane w formacie umożliwiającym wydruk lub przesłanie do działu księgowości, zawierając zestawienie wszystkich tras z danego okresu wraz z podsumowaniem łącznego przebiegu. Uzupełnieniem tej funkcjonalności jest prowadzenie historii wszystkich zarejestrowanych tras z możliwością przeglądania szczegółów poszczególnych przejazdów oraz ich usuwania w razie pomyłki.

### 1.4. Wymagania niefunkcjonalne

Obok wymagań funkcjonalnych określających zakres możliwości aplikacji, zidentyfikowano szereg wymagań niefunkcjonalnych odnoszących się do jakościowych aspektów systemu. Podstawowym wymaganiem tej kategorii jest wieloplatformowość rozwiązania, rozumiana jako możliwość uruchomienia aplikacji zarówno na urządzeniach z systemem operacyjnym Android, jak i iOS. Wymaganie to wynika z realiów rynkowych, gdzie użytkownicy korzystają z urządzeń różnych producentów, a ograniczenie aplikacji do jednej platformy znacząco zawęziłoby potencjalną grupę odbiorców.

Wymaganiem o kluczowym znaczeniu dla akceptacji aplikacji przez użytkowników jest intuicyjność i ergonomia interfejsu. Aplikacja przeznaczona do użytku w kontekście zawodowym musi umożliwiać szybkie wykonanie podstawowych operacji bez konieczności długotrwałego uczenia się obsługi. Szczególnie istotna jest minimalizacja liczby kroków niezbędnych do zarejestrowania trasy, gdyż każda dodatkowa interakcja stanowi barierę mogącą zniechęcić użytkownika do systematycznego korzystania z aplikacji. Interfejs powinien również uwzględniać różnorodność warunków użytkowania, w tym obsługę zarówno w jasnym otoczeniu biurowym, jak i w słabiej oświetlonym wnętrzu samochodu.

Bezpieczeństwo danych użytkowników stanowi wymaganie nienegocjowalne, szczególnie w kontekście przechowywania informacji w infrastrukturze chmurowej. Aplikacja musi zapewniać mechanizmy kontroli dostępu uniemożliwiające odczyt lub modyfikację danych przez osoby nieuprawnione. Komunikacja z serwerami backendowymi powinna odbywać się z wykorzystaniem szyfrowania, a dane składowane w chmurze powinny być chronione regułami bezpieczeństwa weryfikującymi tożsamość użytkownika przed każdą operacją.

Wydajność aplikacji, rozumiana jako responsywność interfejsu oraz czas reakcji na działania użytkownika, wpływa bezpośrednio na doświadczenie użytkowania. Operacje wymagające komunikacji sieciowej, takie jak pobieranie lokalizacji, geokodowanie adresów czy rozpoznawanie tekstu, powinny być realizowane asynchronicznie z odpowiednim sygnalizowaniem postępu, aby nie blokować interfejsu i nie powodować wrażenia zawieszenia aplikacji. Jednocześnie aplikacja powinna racjonalnie gospodarować zasobami urządzenia, w szczególności energią baterii, unikając nadmiernego obciążenia procesora lub ciągłego odpytywania modułu GPS.

### 1.5. Założenia projektowe i ograniczenia

Na podstawie przeprowadzonej analizy sformułowano założenia projektowe stanowiące ramy dla procesu implementacji. Podstawowym założeniem jest realizacja aplikacji w technologii wieloplatformowej z wykorzystaniem wspólnej bazy kodu dla obu platform mobilnych. Decyzja ta, motywowana efektywnością procesu wytwórczego, oznacza wybór frameworka umożliwiającego kompilację do aplikacji natywnych z pojedynczego źródła napisanego w języku wysokiego poziomu. Akceptowanym kompromisem jest potencjalnie niższa wydajność w porównaniu z rozwiązaniami natywnymi, uznano jednak, że dla charakteru projektowanej aplikacji różnica ta nie będzie odczuwalna przez użytkownika końcowego.

Kolejnym założeniem jest wykorzystanie modelu Backend-as-a-Service do realizacji warstwy serwerowej aplikacji. Rozwiązanie to eliminuje konieczność projektowania, implementacji i utrzymywania dedykowanej infrastruktury backendowej, co znacząco redukuje złożoność projektu i umożliwia koncentrację wysiłków na warstwie mobilnej. Przyjęto, że wybrana platforma BaaS powinna oferować zintegrowane usługi uwierzytelniania użytkowników, przechowywania danych strukturalnych oraz plików binarnych, minimalizując liczbę zewnętrznych zależności.

W zakresie usług zewnętrznych przyjęto założenie wykorzystania ogólnodostępnych interfejsów programistycznych oferujących darmowe lub niskokosztowe plany użytkowania. Założenie to wynika z edukacyjnego charakteru projektu oraz dążenia do zapewnienia możliwości kontynuowania działania aplikacji bez generowania znaczących kosztów operacyjnych. Akceptowanym ograniczeniem są limity wywołań charakterystyczne dla darmowych planów, które jednak dla typowego wzorca użytkowania przez pojedynczego użytkownika powinny okazać się wystarczające.

Zidentyfikowano również ograniczenia wynikające z charakteru projektu i dostępnych zasobów. Aplikacja projektowana jest jako rozwiązanie dla użytkowników indywidualnych i nie przewiduje funkcjonalności administracyjnych umożliwiających zarządzanie wieloma użytkownikami przez osobę trzecią, taką jak pracodawca. Implementacja koncentruje się na podstawowym przepływie użytkowania i nie obejmuje zaawansowanych scenariuszy, takich jak praca w trybie offline, synchronizacja danych z zewnętrznymi systemami księgowymi czy obsługa flot pojazdów. Ograniczenia te wyznaczają zakres pierwszej wersji aplikacji i jednocześnie wskazują potencjalne kierunki dalszego rozwoju omówione w podsumowaniu pracy.

---

## ROZDZIAŁ 2. Wykorzystane technologie

### 2.1. Wprowadzenie do stosu technologicznego

Wybór technologii stanowi jeden z kluczowych etapów procesu projektowania aplikacji mobilnej, determinujący zarówno możliwości funkcjonalne systemu, jak i efektywność jego wytwarzania oraz późniejszego utrzymania. Decyzje technologiczne podejmowane na tym etapie muszą uwzględniać wymagania zidentyfikowane w fazie analizy, w szczególności wymóg wieloplatformowości, integracji z usługami geolokalizacyjnymi oraz przetwarzania obrazów. Niniejszy rozdział prezentuje technologie wybrane do realizacji aplikacji wspomagającej rejestrowanie podróży służbowych, uzasadniając każdy wybór w kontekście specyfiki rozwiązywanego problemu oraz ograniczeń projektowych.

Architektura technologiczna aplikacji opiera się na trzech filarach. Pierwszy z nich stanowi warstwa prezentacji i logiki biznesowej, zrealizowana z wykorzystaniem frameworka React Native w połączeniu z platformą Expo. Drugi filar to warstwa backendowa implementowana w modelu Backend-as-a-Service z wykorzystaniem ekosystemu Firebase. Trzeci filar obejmuje integracje z zewnętrznymi interfejsami programistycznymi dostarczającymi specjalistycznych funkcjonalności, takich jak geokodowanie adresów, wyznaczanie tras czy rozpoznawanie tekstu ze zdjęć. Taka organizacja stosu technologicznego pozwala na efektywne wykorzystanie dostępnych usług chmurowych przy jednoczesnym zachowaniu pełnej kontroli nad logiką aplikacji mobilnej.

### 2.2. Framework React Native

Fundamentem technologicznym warstwy mobilnej aplikacji jest React Native, framework programistyczny umożliwiający tworzenie natywnych aplikacji mobilnych z wykorzystaniem języka JavaScript oraz biblioteki React. React Native został opracowany przez firmę Meta i udostępniony jako projekt open source w 2015 roku, od tego czasu zyskując pozycję jednego z najpopularniejszych narzędzi do wieloplatformowego wytwarzania aplikacji mobilnych. W projekcie wykorzystano wersję 0.81.5 frameworka, reprezentującą dojrzały i stabilny stan rozwoju technologii.

Wybór React Native jako podstawy technologicznej aplikacji podyktowany został przede wszystkim wymaganiem wieloplatformowości sformułowanym w rozdziale pierwszym. Framework ten umożliwia tworzenie aplikacji działających zarówno na urządzeniach z systemem Android, jak i iOS, przy wykorzystaniu wspólnej bazy kodu źródłowego napisanego w języku JavaScript. Podejście to zasadniczo różni się od alternatywnych rozwiązań wieloplatformowych opartych na technologii WebView, gdzie interfejs użytkownika renderowany jest przez silnik przeglądarki internetowej osadzony w aplikacji natywnej. React Native implementuje odmienną architekturę, w której komponenty interfejsu napisane w JavaScript są mapowane na rzeczywiste komponenty natywne platformy docelowej, co przekłada się na wydajność i responsywność zbliżoną do aplikacji tworzonych w językach natywnych.

Architektura React Native opiera się na koncepcji tzw. mostu, stanowiącego warstwę komunikacyjną pomiędzy kodem JavaScript wykonującym się w dedykowanym środowisku uruchomieniowym a natywnymi modułami platformy. Komunikacja ta odbywa się asynchronicznie z wykorzystaniem serializacji danych do formatu JSON, co pozwala na utrzymanie responsywności interfejsu nawet podczas wykonywania intensywnych obliczeniowo operacji. Dodatkowo React Native wykorzystuje mechanizm wirtualnego drzewa widoków oraz algorytm rekoncyliacji, które optymalizują proces aktualizacji interfejsu poprzez minimalizację liczby operacji na rzeczywistych komponentach natywnych.

Istotną zaletą React Native jest rozbudowany ekosystem bibliotek i narzędzi, umożliwiający integrację z funkcjonalnościami platformowymi oraz zewnętrznymi usługami. Deklaratywny model programowania interfejsu użytkownika, oparty na koncepcji komponentów i jednokierunkowego przepływu danych, sprzyja tworzeniu kodu modularnego i łatwego w utrzymaniu. Znajomość języka JavaScript oraz biblioteki React, będących standardowymi technologiami w środowisku webowym, obniża barierę wejścia dla programistów i ułatwia rekrutację zespołów deweloperskich.

### 2.3. Platforma Expo

Uzupełnieniem frameworka React Native w projekcie jest platforma Expo, stanowiąca warstwę abstrakcji dostarczającą zunifikowanych interfejsów programistycznych do funkcjonalności platformowych oraz narzędzi usprawniających proces wytwórczy. Expo składa się z trzech głównych elementów: zestawu bibliotek programistycznych, narzędzi deweloperskich oraz usług chmurowych wspierających budowanie i dystrybucję aplikacji. W projekcie wykorzystano wersję 54.0.20 platformy, która wprowadza szereg usprawnień w zakresie wydajności oraz rozszerza zakres obsługiwanych funkcjonalności natywnych.

Decyzja o wykorzystaniu platformy Expo wynikała z dążenia do uproszczenia procesu deweloperskiego oraz redukcji złożoności konfiguracyjnej projektu. Tradycyjne projekty React Native wymagają bezpośredniej konfiguracji natywnych projektów Android i iOS, co wiąże się z koniecznością znajomości narzędzi deweloperskich obu platform oraz zarządzania zależnościami natywnymi. Expo eliminuje tę złożoność, ukrywając szczegóły implementacyjne za zunifikowanymi interfejsami programistycznymi i automatyzując procesy budowania aplikacji. Jest to szczególnie istotne w kontekście wytwarzania aplikacji na platformę iOS, gdzie natywne narzędzia deweloperskie dostępne są wyłącznie na komputerach z systemem macOS.

Platforma Expo dostarcza bogaty zestaw bibliotek obsługujących typowe funkcjonalności aplikacji mobilnych, które w projekcie znalazły szerokie zastosowanie. Expo Location umożliwia interakcję z usługami lokalizacyjnymi urządzenia, Expo Camera i Expo Image Picker zapewniają dostęp do aparatu fotograficznego i galerii, Expo Notifications obsługuje powiadomienia lokalne, a Expo Print i Expo Sharing realizują funkcjonalności generowania dokumentów i udostępniania plików. Wykorzystanie bibliotek Expo zamiast bezpośredniej integracji z natywnymi interfejsami programistycznymi znacząco przyspiesza proces implementacji i redukuje ilość kodu specyficznego dla poszczególnych platform.

Usługa Expo Application Services, będąca częścią ekosystemu Expo, umożliwia budowanie produkcyjnych wersji aplikacji w infrastrukturze chmurowej. Rozwiązanie to eliminuje wymóg posiadania lokalnego środowiska deweloperskiego dla każdej z platform docelowych, co jest szczególnie wartościowe w przypadku projektów realizowanych przez pojedynczych deweloperów lub małe zespoły nieposiadające dostępu do sprzętu Apple niezbędnego do kompilacji aplikacji iOS.

### 2.4. Usługi geolokalizacyjne

Automatyczne rejestrowanie lokalizacji geograficznej stanowi jedną z kluczowych funkcjonalności aplikacji, wymagającą integracji z usługami lokalizacyjnymi urządzenia mobilnego. Funkcjonalność tę realizuje biblioteka Expo Location w wersji 19.0.7, dostarczająca zunifikowanego interfejsu programistycznego abstrahującego od różnic implementacyjnych pomiędzy platformami Android i iOS. Biblioteka ta umożliwia zarówno jednorazowe pobieranie bieżącej pozycji urządzenia, jak i ciągłe monitorowanie zmian lokalizacji, oferując przy tym konfigurowalny poziom dokładności pomiaru.

Implementacja wykorzystuje tryb lokalizacji pierwszoplanowej, który wymaga aktywnego wyświetlania aplikacji podczas pobierania współrzędnych geograficznych. Decyzja o rezygnacji z trybu lokalizacji w tle podyktowana została względami prywatności użytkownika oraz oszczędnością energii baterii urządzenia. W kontekście rejestrowania podróży służbowych tryb ten okazuje się wystarczający, gdyż użytkownik świadomie inicjuje proces rejestracji przed rozpoczęciem trasy i kończy go po dotarciu do celu. Biblioteka obsługuje również zarządzanie uprawnieniami systemowymi, automatycznie inicjując dialog żądania zgody użytkownika przy pierwszej próbie dostępu do lokalizacji.

Pobrane współrzędne geograficzne wyrażone jako szerokość i długość geograficzna wymagają konwersji na adresy tekstowe zrozumiałe dla użytkownika oraz obliczenia rzeczywistego dystansu trasy uwzględniającego siatkę drogową. Funkcjonalności te realizowane są poprzez integrację z zewnętrzną usługą OpenRouteService, oferującą interfejs programistyczny RESTful do operacji geokodowania i wyznaczania tras. OpenRouteService jest projektem open source opartym na danych kartograficznych OpenStreetMap, co zapewnia dostęp do aktualnych informacji geograficznych bez ograniczeń licencyjnych charakterystycznych dla komercyjnych usług mapowych.

Geokodowanie, czyli proces transformacji współrzędnych geograficznych na adres tekstowy, wykorzystuje punkt końcowy interfejsu programistycznego do wyszukiwania odwrotnego. Usługa zwraca najbardziej prawdopodobny adres odpowiadający podanym współrzędnym, wraz z dodatkowymi informacjami o lokalizacji, takimi jak nazwa miejscowości czy kod pocztowy. Operacja odwrotna, polegająca na konwersji adresu tekstowego na współrzędne, wykorzystywana jest w trybie manualnym tworzenia tras, gdzie użytkownik wprowadza adresy zamiast polegać na automatycznym pobieraniu lokalizacji.

Obliczanie dystansu trasy realizowane jest z wykorzystaniem funkcjonalności wyznaczania tras oferowanej przez OpenRouteService. W odróżnieniu od prostego obliczenia odległości w linii prostej pomiędzy dwoma punktami, usługa ta wyznacza optymalną trasę przejazdu uwzględniającą rzeczywisty przebieg dróg, ograniczenia prędkości oraz inne czynniki wpływające na czas podróży. Implementacja wykorzystuje profil podróży samochodem, który modeluje zachowanie typowego pojazdu osobowego i zwraca zarówno dystans w kilometrach, jak i szacowany czas przejazdu w minutach.

### 2.5. Technologia rozpoznawania tekstu

Minimalizacja nakładu pracy użytkownika związanego z wprowadzaniem danych stanowiła jedno z założeń projektowych aplikacji, którego realizację umożliwia technologia optycznego rozpoznawania znaków. OCR, będący akronimem od angielskiego terminu Optical Character Recognition, oznacza proces automatycznej ekstrakcji tekstu z obrazów cyfrowych. W kontekście projektowanej aplikacji technologia ta wykorzystywana jest do odczytywania stanu licznika pojazdu ze zdjęć deski rozdzielczej, eliminując konieczność ręcznego przepisywania wartości przebiegu przez użytkownika.

Implementacja funkcjonalności OCR opiera się na integracji z usługą OCR.space, oferującą interfejs programistyczny do rozpoznawania tekstu z przesłanych obrazów. Usługa ta działa w modelu chmurowym, gdzie przetwarzanie obrazu odbywa się na serwerach dostawcy, a aplikacja mobilna otrzymuje wyniki w postaci rozpoznanego tekstu. Wybór tej konkretnej usługi podyktowany został dostępnością darmowego planu użytkowania obejmującego znaczny limit wywołań miesięcznych, co odpowiada założeniu projektowemu dotyczącemu minimalizacji kosztów operacyjnych.

Proces rozpoznawania tekstu w aplikacji inicjowany jest przez użytkownika poprzez wykonanie fotografii licznika pojazdu. Zdjęcie poddawane jest wstępnemu przetwarzaniu obejmującemu kompresję i konwersję do formatu Base64, a następnie transmitowane do punktu końcowego usługi OCR.space. Usługa przetwarza obraz z wykorzystaniem zaawansowanych algorytmów rozpoznawania wzorców i zwraca odpowiedź zawierającą wszystkie wykryte fragmenty tekstu wraz z informacjami o ich położeniu na obrazie. Implementacja wykorzystuje silnik OCR zoptymalizowany pod kątem rozpoznawania cyfr, co zwiększa dokładność odczytu numerycznych wskazań licznika.

Odpowiedź usługi OCR zawiera zwykle wiele rozpoznanych fragmentów tekstu, spośród których należy zidentyfikować wartość reprezentującą przebieg pojazdu. Aplikacja implementuje algorytm heurystyczny analizujący wszystkie wykryte liczby i wybierający tę najbardziej prawdopodobnie odpowiadającą stanowi licznika. Heurystyka uwzględnia typowy zakres wartości przebiegu pojazdów osobowych, preferując liczby rzędu dziesiątek i setek tysięcy. Wynik rozpoznawania prezentowany jest użytkownikowi do akceptacji lub korekty, co pozwala na weryfikację poprawności automatycznego odczytu przed zapisaniem danych.

### 2.6. Obsługa multimediów

Dokumentowanie podróży służbowych wymaga możliwości wykonywania i przechowywania fotografii, które mogą stanowić potwierdzenie wykonania trasy lub dokumentację stanu licznika pojazdu. Funkcjonalność tę w aplikacji realizuje zestaw bibliotek Expo obsługujących interakcję z aparatem fotograficznym i galerią urządzenia. Expo Camera w wersji 17.0.9 dostarcza interfejs programistyczny do bezpośredniego dostępu do aparatu, umożliwiając wykonywanie zdjęć bez opuszczania aplikacji. Expo Image Picker w wersji 17.0.8 odpowiada za integrację z galerią systemową, pozwalając użytkownikowi na wybór wcześniej wykonanych fotografii.

Implementacja obsługi multimediów w aplikacji została zaprojektowana z myślą o elastyczności użytkowania. Użytkownik może wybrać pomiędzy wykonaniem nowego zdjęcia aparatem urządzenia a wyborem istniejącej fotografii z galerii, co jest szczególnie przydatne w sytuacjach, gdy zdjęcie licznika zostało wykonane wcześniej przy użyciu natywnej aplikacji aparatu. Interfejs wyboru źródła zdjęcia prezentowany jest w postaci modalnego okna dialogowego, minimalizując liczbę kroków niezbędnych do dołączenia fotografii do rejestrowanej trasy.

Biblioteka Expo Image Manipulator w wersji 14.0.7 uzupełnia funkcjonalność obsługi multimediów o możliwość programowego przetwarzania obrazów. W aplikacji wykorzystywana jest przede wszystkim do kompresji zdjęć przed ich przesłaniem do usługi rozpoznawania tekstu oraz do infrastruktury chmurowej przechowywania plików. Kompresja realizowana jest poprzez redukcję rozdzielczości obrazu oraz dostosowanie poziomu jakości JPEG, co pozwala na znaczące zmniejszenie rozmiaru pliku przy zachowaniu wystarczającej czytelności dla celów dokumentacyjnych i algorytmów OCR. Optymalizacja ta przekłada się na oszczędność przepustowości łącza internetowego oraz przestrzeni dyskowej w chmurze.

### 2.7. Ekosystem Firebase

Warstwa backendowa aplikacji zrealizowana została z wykorzystaniem ekosystemu Firebase, oferowanego przez firmę Google w modelu Backend-as-a-Service. Firebase dostarcza zintegrowany zestaw usług chmurowych obejmujący uwierzytelnianie użytkowników, przechowywanie danych strukturalnych, przechowywanie plików binarnych oraz wiele innych funkcjonalności typowych dla aplikacji mobilnych. Wybór tej platformy podyktowany został założeniem projektowym dotyczącym wykorzystania modelu BaaS, eliminującego konieczność projektowania i utrzymywania dedykowanej infrastruktury serwerowej.

Firebase Authentication stanowi moduł odpowiedzialny za uwierzytelnianie i autoryzację użytkowników aplikacji. W implementacji wykorzystano metodę uwierzytelniania opartą na adresie poczty elektronicznej oraz haśle, która stanowi powszechnie akceptowany standard w aplikacjach mobilnych. Moduł obsługuje pełen cykl życia sesji użytkownika, począwszy od rejestracji nowego konta, przez proces logowania i weryfikację tożsamości, aż po bezpieczne wylogowanie. Firebase Authentication generuje tokeny sesji wykorzystywane do autoryzacji żądań kierowanych do pozostałych usług ekosystemu, zapewniając spójny model bezpieczeństwa w całym systemie.

Integracja Firebase Authentication z biblioteką AsyncStorage w wersji 1.24.0 umożliwia persystencję sesji użytkownika pomiędzy uruchomieniami aplikacji. AsyncStorage jest asynchronicznym magazynem klucz-wartość dostępnym na urządzeniu mobilnym, pełniącym rolę analogiczną do mechanizmu localStorage w środowisku przeglądarek internetowych. Token sesji zapisany w AsyncStorage pozwala na automatyczne odtworzenie stanu uwierzytelnienia przy kolejnym uruchomieniu aplikacji, eliminując konieczność ponownego wprowadzania danych logowania przez użytkownika.

Firebase Cloud Firestore pełni funkcję głównego magazynu danych strukturalnych aplikacji, przechowując informacje o zarejestrowanych trasach podróży służbowych. Firestore jest nierelacyjną bazą danych typu NoSQL o architekturze dokumentowej, w której dane organizowane są w hierarchię kolekcji zawierających dokumenty o elastycznej strukturze. Model ten charakteryzuje się znaczną elastycznością, umożliwiając ewolucję schematu danych bez konieczności przeprowadzania formalnych migracji, co jest szczególnie wartościowe w kontekście iteracyjnego procesu wytwarzania aplikacji.

Istotną cechą Firestore wykorzystywaną w aplikacji jest wsparcie dla synchronizacji danych w czasie rzeczywistym. Mechanizm nasłuchiwania zmian pozwala na automatyczne odświeżanie listy tras w interfejsie użytkownika natychmiast po dodaniu, modyfikacji lub usunięciu dokumentu w bazie danych. Funkcjonalność ta eliminuje konieczność manualnego odświeżania widoków i zapewnia spójność prezentowanych danych z ich rzeczywistym stanem w bazie, co przekłada się na pozytywne doświadczenie użytkowania.

### 2.8. Appwrite Cloud Storage

Przechowywanie plików binarnych, w szczególności fotografii licznika dołączanych do rejestrowanych tras, realizowane jest z wykorzystaniem usługi Appwrite Cloud Storage. Decyzja o wyborze platformy Appwrite zamiast Firebase Cloud Storage podyktowana została względami ekonomicznymi, gdyż usługa przechowywania plików w ekosystemie Firebase dostępna jest wyłącznie w ramach płatnych planów taryfowych, podczas gdy Appwrite oferuje hojny darmowy limit przestrzeni dyskowej wystarczający dla potrzeb projektowanej aplikacji. Wybór ten ilustruje praktyczne podejście do architektury systemów, gdzie poszczególne komponenty dobierane są z różnych platform w zależności od ich dostępności i kosztów, zamiast ograniczania się do pojedynczego ekosystemu.

Appwrite jest platformą Backend-as-a-Service o otwartym kodzie źródłowym, oferującą szereg usług backendowych porównywalnych funkcjonalnie z Firebase, w tym uwierzytelnianie, bazy danych, przechowywanie plików oraz funkcje serverless. W kontekście projektowanej aplikacji wykorzystywana jest wyłącznie usługa Cloud Storage, pozostałe funkcjonalności backendowe realizowane są przez ekosystem Firebase. Takie hybrydowe podejście pozwala na optymalne wykorzystanie zalet obu platform przy jednoczesnej minimalizacji kosztów operacyjnych.

Usługa Appwrite Cloud Storage udostępnia interfejs programistyczny RESTful do zarządzania plikami, umożliwiający operacje przesyłania, pobierania oraz usuwania obiektów. Implementacja w aplikacji wykorzystuje dedykowaną bibliotekę kliencką Appwrite dla React Native, która abstrahuje szczegóły komunikacji z serwerem i dostarcza ergonomiczny interfejs programistyczny. Pliki fotografii przesyłane są do wydzielonego zasobnika skonfigurowanego z odpowiednimi regułami dostępu, a zwracane identyfikatory plików zapisywane są w dokumentach tras w bazie Firestore, tworząc powiązanie pomiędzy danymi strukturalnymi a plikami binarnymi.

### 2.9. System nawigacji

Architektura nawigacji w aplikacji oparta została na bibliotece Expo Router w wersji 6.0.14, implementującej paradygmat routingu bazującego na strukturze systemu plików. Podejście to, zainspirowane rozwiązaniami stosowanymi w nowoczesnych frameworkach webowych takich jak Next.js, umożliwia automatyczne generowanie tras nawigacyjnych na podstawie hierarchii katalogów i plików w strukturze projektu. Każdy plik z rozszerzeniem JSX umieszczony w dedykowanym katalogu reprezentuje odrębny ekran aplikacji, a nazwy plików determinują ścieżki nawigacyjne.

Expo Router eliminuje konieczność manualnej konfiguracji routera nawigacyjnego, która w tradycyjnych projektach React Native wymaga jawnego definiowania mapowań pomiędzy ścieżkami a komponentami ekranów. Automatyczne generowanie tras na podstawie struktury plików redukuje ryzyko niespójności pomiędzy definicją nawigacji a rzeczywistą organizacją kodu oraz upraszcza dodawanie nowych ekranów do aplikacji. Biblioteka wspiera zaawansowane scenariusze nawigacyjne, w tym trasy dynamiczne z parametrami, wykorzystywane w aplikacji do wyświetlania szczegółów konkretnej trasy identyfikowanej przez unikalny identyfikator.

Struktura nawigacyjna aplikacji wykorzystuje mechanizm grup tras, pozwalający na logiczne organizowanie ekranów współdzielących wspólny układ lub wymagania dotyczące uwierzytelnienia. W projekcie zdefiniowano trzy grupy: ekrany publiczne dostępne dla wszystkich użytkowników, ekrany autentykacyjne dostępne wyłącznie dla użytkowników niezalogowanych oraz ekrany panelu głównego wymagające uwierzytelnienia. Separacja ta realizowana jest z wykorzystaniem komponentów opakowujących weryfikujących stan uwierzytelnienia i przekierowujących użytkownika do odpowiedniej sekcji aplikacji.

### 2.10. System powiadomień

Funkcjonalność informowania użytkownika o trwającej trasie realizowana jest z wykorzystaniem biblioteki Expo Notifications w wersji 0.32.14, obsługującej powiadomienia lokalne generowane bezpośrednio przez aplikację. Powiadomienia lokalne, w odróżnieniu od powiadomień push wymagających infrastruktury serwerowej, działają niezależnie od dostępności połączenia internetowego i nie wymagają konfiguracji zewnętrznych usług dostarczania wiadomości. W kontekście aplikacji do rejestrowania tras powiadomienia wykorzystywane są do wyświetlania trwałego komunikatu informującego o aktywnej trasie w trakcie jej rejestrowania.

Implementacja systemu powiadomień uwzględnia różnice pomiędzy platformami Android i iOS w zakresie wymagań dotyczących konfiguracji i uprawnień. Na platformie Android, począwszy od wersji 8.0 systemu operacyjnego, wymagane jest jawne zdefiniowanie kanałów powiadomień specyfikujących charakterystyki wizualne i dźwiękowe komunikatów. Aplikacja konfiguruje dedykowany kanał dla powiadomień o aktywnych trasach, określając poziom ważności, wzorzec wibracji oraz zachowanie na ekranie blokady. Na platformie iOS konieczne jest uzyskanie explicite zgody użytkownika na wyświetlanie powiadomień, co realizowane jest poprzez dialog systemowy prezentowany przy pierwszej próbie utworzenia powiadomienia.

Powiadomienie o trwającej trasie wyświetlane jest przez cały czas jej rejestrowania, stanowiąc wizualne przypomnienie dla użytkownika oraz umożliwiając szybki powrót do ekranu trasy poprzez interakcję z komunikatem. Mechanizm persystencji identyfikatorów powiadomień z wykorzystaniem AsyncStorage pozwala na aktualizację lub usunięcie powiadomienia w późniejszym czasie, nawet po ponownym uruchomieniu aplikacji. Powiadomienie jest automatycznie usuwane po zakończeniu trasy lub jej anulowaniu przez użytkownika.

### 2.11. Generowanie dokumentów

Funkcjonalność generowania raportów zbiorczych z zarejestrowanych tras realizowana jest z wykorzystaniem bibliotek Expo Print w wersji 15.0.7 oraz Expo Sharing w wersji 14.0.7. Expo Print dostarcza interfejs programistyczny do generowania dokumentów PDF z kodu HTML, umożliwiając tworzenie profesjonalnie sformatowanych raportów zawierających zestawienia tras wraz z podsumowaniami. Expo Sharing uzupełnia tę funkcjonalność o możliwość udostępniania wygenerowanych dokumentów za pośrednictwem systemowego dialogu udostępniania, który prezentuje użytkownikowi dostępne opcje, takie jak wysłanie pocztą elektroniczną, zapisanie w chmurze czy wydrukowanie na drukarce.

Proces generowania raportu rozpoczyna się od przygotowania danych reprezentujących trasy z wybranego okresu rozliczeniowego. Dane te formatowane są w postaci dokumentu HTML z wykorzystaniem tabel i stylów CSS, co pozwala na uzyskanie czytelnego układu informacji. Biblioteka Expo Print renderuje dokument HTML do formatu PDF, generując plik gotowy do wydruku lub archiwizacji. Wygenerowany dokument zawiera nagłówek z informacjami identyfikującymi użytkownika i okres rozliczeniowy, szczegółowe zestawienie poszczególnych tras z datami, adresami i dystansami oraz podsumowanie prezentujące łączny przebieg w danym okresie.

### 2.12. Podsumowanie rozdziału

Przedstawiony w niniejszym rozdziale stos technologiczny stanowi spójne rozwiązanie adresujące wymagania zidentyfikowane w fazie analizy. Framework React Native z platformą Expo realizuje wymóg wieloplatformowości, umożliwiając wytworzenie aplikacji działającej na systemach Android i iOS z wykorzystaniem wspólnej bazy kodu. Warstwa backendowa oparta została na hybrydowym modelu łączącym usługi Firebase w zakresie uwierzytelniania i przechowywania danych strukturalnych z platformą Appwrite w zakresie przechowywania plików binarnych. Takie podejście ilustruje pragmatyczną strategię doboru technologii, gdzie poszczególne komponenty wybierane są na podstawie ich dostępności, funkcjonalności oraz kosztów, zamiast ograniczania się do pojedynczego ekosystemu. Integracje z zewnętrznymi usługami geokodowania, wyznaczania tras oraz rozpoznawania tekstu realizują specjalistyczne funkcjonalności stanowiące o wartości użytkowej aplikacji.

Wybrane technologie charakteryzują się dojrzałością i stabilnością, będąc szeroko stosowanymi w komercyjnych projektach aplikacji mobilnych. Dostępność obszernej dokumentacji oraz aktywnych społeczności deweloperskich ułatwia rozwiązywanie problemów napotykanych w procesie implementacji. Wykorzystanie darmowych planów użytkowania usług zewnętrznych odpowiada założeniu projektowemu dotyczącemu minimalizacji kosztów operacyjnych, przy czym oferowane limity wywołań są wystarczające dla typowych wzorców użytkowania przez indywidualnych użytkowników.

---

## ROZDZIAŁ 3. Architektura i struktura aplikacji

*[Do uzupełnienia]*

---

## ROZDZIAŁ 4. Interfejs użytkownika i funkcjonalności

*[Do uzupełnienia]*

---

## PODSUMOWANIE

*[Do uzupełnienia]*

