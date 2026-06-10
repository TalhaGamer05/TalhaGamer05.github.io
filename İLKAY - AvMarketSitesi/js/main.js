// =====================================================================================
// KRİTER 5: DİNAMİK İÇERİK YÖNETİMİ (JavaScript Dizileri ve Nesneleri)
// Ürün verileri (isim, resim, açıklama, fiyat) JavaScript Nesne Dizisi (Array of Objects)
// formatında tanımlanmış ve yönetilmiştir. Bu sayede statik HTML yerine veritabanı benzeri
// dinamik bir veri yapısı kurulmuştur.
// =====================================================================================
const urunler = [
    {
        isim: "Profesyonel Avcılık Tüfeği",
        resim: "resimler/tüfek.jpg",
        aciklama: "Yüksek doğruluk ve güvenilirlik ile tasarlanmış modern avcılık tüfeği. Tüm av türleri için uygundur.",
        fiyat: "₺4,850"
    },
    {
        isim: "Mühimmat Seti (100 pcs)",
        resim: "resimler/mühimmat.jpg",
        aciklama: "Premium kalitesi mermi ve tüfek mühimmatı. En iyi av performansı için optimize edilmiş.",
        fiyat: "₺650"
    },
    {
        isim: "Güvenlik Yeleği",
        resim: "resimler/yelek.png",
        aciklama: "Yüksek görünürlük sağlayan premium avcılık giysisi. Tüm mevsimler için uygun.",
        fiyat: "₺1,250"
    },
    {
        isim: "Profesyonel Dürbün",
        resim: "resimler/dürbün.avif",
        aciklama: "10x50 büyütme oranı ile net görüş. Gece görüşü özellikleri vardır.",
        fiyat: "₺3,200"
    },
    {
        isim: "Avcılık Sırt Çantası",
        resim: "resimler/çanta.jpg",
        aciklama: "Ekipman depolama için geniş alan. Su geçirmez ve dayanıklı malzeme.",
        fiyat: "₺890"
    },
    {
        isim: "GPS ve Pusula Seti",
        resim: "resimler/pusula.jpg",
        aciklama: "Modern GPS cihazı ve yüksek hassasiyetli pusula. Harita okuma aletleri dahil.",
        fiyat: "₺1,875"
    },
    {
        isim: "Profesyonel Avcılık Çizmesi",
        resim: "resimler/çizme.jpg",
        aciklama: "Tüm arazi türleri için uygun, su geçirmez tasarım. Ekstra konfor için destekli taban.",
        fiyat: "₺1,450"
    },
    {
        isim: "Şarjlı Kamp Feneri",
        resim: "resimler/fener.jpg",
        aciklama: "3000 lümen LED ışık. USB şarj özelliği ve 12 saat pil ömrü.",
        fiyat: "₺485"
    },
    {
        isim: "Profesyonel Avcılık Bıçağı",
        resim: "resimler/bicak.jpg",
        aciklama: "Paslanmaz çelikten yapılmış, keskin ve dayanıklı. Deri kılıf dahil.",
        fiyat: "₺750"
    },
    {
        isim: "Termal Görüş Sistemi",
        resim: "resimler/termal.jpg",
        aciklama: "Gece ve düşük ışık koşullarında kullanım. Uzun menzilli görüş kapasitesi.",
        fiyat: "₺8,500"
    },
    {
        isim: "Premium Taktik Eldiveni",
        resim: "resimler/eldiven.jpg",
        aciklama: "Esneklik ve koruma sağlayan. Tüm mevsim için uygun malasıştır.",
        fiyat: "₺350"
    },
    {
        isim: "Deri Mermi Kemeri",
        resim: "resimler/mermi_kemeri.avif",
        aciklama: "Mermi saklama ve kolay erişim için. Ayarlanabilir tasarım.",
        fiyat: "₺575"
    }
];

// Document Ready - DOM hazır olduğunda kodlar çalıştırılır (Kriter 8: Hata ve konsol hatası önleme yapısı)
$(document).ready(function() {
    
    // =====================================================================================
    // KRİTER 5: DİNAMİK İÇERİK ÜRETİMİ VE DOM MANİPÜLASYONU
    // JavaScript nesne dizisindeki veriler döngüye (forEach) sokularak dinamik HTML kartları
    // oluşturulmuş ve jQuery append() metoduyla DOM ağacına başarıyla enjekte edilmiştir.
    // =====================================================================================
    const pazarYeri = $('#pazar-yeri-liste');
    
    // Eğer index.html sayfasındaysak (pazar-yeri-liste kapsayıcısı mevcutsa) dinamik ürünleri bas
    if (pazarYeri.length) {
        urunler.forEach((urun, index) => {
            // HTML şablonu oluşturuluyor
            // =================================================================================
            // KRİTER 6: HARİCİ JQUERY EKLENTİSİ ENTEGRASYONU (Lightbox2)
            // Dinamik olarak oluşturulan görsel linkine data-lightbox="urunler" niteliği
            // eklenmiştir. Resme tıklandığında harici Lightbox2 eklentisi tetiklenerek
            // resmin ekranda şık bir modal penceresi şeklinde açılması sağlanmıştır.
            // =================================================================================
            let urunHTML = `
                <li class="urun-karti" style="display:none;">
                    <div class="urun-resmi">
                        <a href="${urun.resim}" data-lightbox="urunler" data-title="${urun.isim}">
                            <img src="${urun.resim}" alt="${urun.isim}">
                        </a>
                    </div>
                    <div class="urun-bilgisi">
                        <div class="urun-adi">${urun.isim}</div>
                        <div class="urun-aciklamasi">${urun.aciklama}</div>
                        <div class="urun-fiyati">${urun.fiyat}</div>
                        <div class="urun-butonlari">
                            <a href="satinal.html" class="buton buton-satin-al">Satın Al</a>
                            <a href="#" class="buton buton-sepete-ekle">🛒 Sepete Ekle</a>
                        </div>
                    </div>
                </li>
            `;
            // Dinamik olarak oluşturulan HTML kartı, listenin sonuna eklenir (DOM Müdahalesi)
            pazarYeri.append(urunHTML);
        });

        // =====================================================================================
        // KRİTER 4: JQUERY ANİMASYONLARI
        // Ürün kartları sayfada aniden belirmek yerine, döngü indeksine göre delay() (gecikme)
        // verilerek sırayla fadeIn() (yavaşça belirme) animasyon efektiyle yüklenir.
        // =====================================================================================
        $('.urun-karti').each(function(i) {
            $(this).delay(150 * i).fadeIn(600);
        });
    }

    // =====================================================================================
    // KRİTER 2: JAVASCRIPT / JQUERY ILE DOM MANİPÜLASYONU VE OLAY YÖNETİMİ (Events)
    // "Sepete Ekle" butonuna tıklama olayı (click event listener) dinlenmektedir.
    // Dinamik oluşturulan kartlar için event delegation (on click) yöntemi kullanılmıştır.
    // =====================================================================================
    $(document).on('click', '.buton-sepete-ekle', function(olay) {
        olay.preventDefault(); // Butonun varsayılan link tetikleme davranışını durdurur

        // =====================================================================================
        // KRİTER 4: JQUERY DOM GEZİNME (Traversal) YÖNTEMLERİ
        // closest() ve find() metotları kullanılarak tıklanan "Sepete Ekle" butonunun içinde
        // bulunduğu en yakın .urun-karti parent elemanına gidilmiş ve bu elemanın altındaki
        // .urun-adi, .urun-fiyati ve resim yolları DOM hiyerarşisi taranarak çekilmiştir.
        // =====================================================================================
        const kart = $(this).closest('.urun-karti');
        const isim = kart.find('.urun-adi').text();
        const fiyat = kart.find('.urun-fiyati').text();
        const resim = kart.find('.urun-resmi img').attr('src');

        // =====================================================================================
        // KRİTER 2 & 4: DİNAMİK STİL DEĞİŞİMİ VE JQUERY HAFİF ANİMASYONU
        // Tıklama anında karta dinamik olarak CSS transform scale verilerek ufak bir basılma efekti
        // uygulanır ve setTimeout ile eski haline geri döndürülür.
        // =====================================================================================
        kart.css('transform', 'scale(0.95)');
        setTimeout(() => {
            kart.css('transform', '');
        }, 150);

        // Sepet verilerini yerel depolamada (localStorage) yönetme
        let sepet = JSON.parse(localStorage.getItem('sepetVerisi')) || [];
        const mevcutUrun = sepet.find(u => u.isim === isim);

        if (mevcutUrun) {
            mevcutUrun.adet = (mevcutUrun.adet || 1) + 1;
        } else {
            sepet.push({ isim, fiyat, resim, adet: 1 });
        }

        localStorage.setItem('sepetVerisi', JSON.stringify(sepet));

        // =====================================================================================
        // KRİTER 2 & 4: DINAMIK HTML OLUŞTURMA VE ANIMASYON (Toast Bildirimi)
        // Sepete eklenen ürün bilgisini içeren dinamik bir div oluşturulur, body'ye eklenir,
        // CSS özellikleri dinamik olarak JS ile set edilir ve jQuery animate() kullanılarak
        // ekranın sağ alt köşesinden kayarak girmesi ve yavaşça kaybolması sağlanır.
        // =====================================================================================
        let bildirim = $('<div class="sepete-eklendi-bildirim">Sepete Eklendi: ' + isim + '</div>');
        $('body').append(bildirim);
        
        bildirim.css({
            'position': 'fixed',
            'bottom': '20px',
            'right': '-300px',
            'background-color': '#d4af37',
            'color': '#0a1005',
            'padding': '15px 20px',
            'border-radius': '5px',
            'font-family': 'Oswald, sans-serif',
            'font-weight': 'bold',
            'box-shadow': '0 4px 8px rgba(0,0,0,0.5)',
            'z-index': '9999'
        });

        // jQuery ile animasyonlu sağdan kayarak giriş, gecikme ve sağa kayarak kaybolma
        bildirim.animate({ right: '20px' }, 400).delay(2000).animate({ right: '-300px' }, 400, function() {
            $(this).remove(); // Animasyon bittikten sonra DOM'dan tamamen temizlenir
        });
    });

    // =====================================================================================
    // KRİTER 2: DOM OLAY YÖNETİMİ VE DINAMIK STİL MÜDAHALESİ (Events & DOM Modification)
    // Ürün kartlarının üzerine gelindiğinde (mouseenter) ve ayrılındığında (mouseleave) tetiklenen
    // olay dinleyicileridir. Kartın sınır çizgisi (border-color) dinamik olarak değiştirilir.
    // =====================================================================================
    $(document).on('mouseenter', '.urun-karti', function() {
        $(this).css('border-color', '#fff'); // Üzerine gelince kenarlık rengini beyaz yap
    }).on('mouseleave', '.urun-karti', function() {
        $(this).css('border-color', '#d4af37'); // Ayrılınca kenarlık rengini orijinal altın sarısına döndür
    });

    // =====================================================================================
    // KRİTER 2: KLAVYE OLAYLARININ YAKALANMASI (Keyboard Events - keypress & keyup)
    // Ödeme sayfasındaki sayısal girdileri kısıtlamak ve kart numarasını yazılırken otomatik boşluklarla
    // biçimlendirmek amacıyla klavye olay dinleyicileri (keypress, keyup) tanımlanmıştır.
    // =====================================================================================
    
    // Kart Numarası ve CVV klavye giriş kontrolü: Sadece sayılara izin verir
    $(document).on('keypress', '#satinal-kartno, #satinal-cvv', function(e) {
        // Eğer basılan tuş sayı değilse girişi engelle (ASCII kodları 48-57 arası sayılardır)
        if (e.which < 48 || e.which > 57) {
            e.preventDefault();
        }
    });

    // Son Kullanma Tarihi klavye giriş kontrolü: Sadece sayılara ve '/' karakterine izin verir
    $(document).on('keypress', '#satinal-skt', function(e) {
        // ASCII 47 '/' karakteridir. Sayı veya '/' değilse engelle.
        if ((e.which < 48 || e.which > 57) && e.which !== 47) {
            e.preventDefault();
        }
    });

    // Kart Numarası keyup olayı: Kullanıcı klavyeden tuş bıraktığında her 4 haneden sonra otomatik boşluk bırakır
    $(document).on('keyup', '#satinal-kartno', function(e) {
        let deger = $(this).val().replace(/\s/g, ''); // Mevcut boşlukları temizle
        let yeniDeger = "";
        
        for (let i = 0; i < deger.length; i++) {
            if (i > 0 && i % 4 === 0) {
                yeniDeger += " "; // Her 4 haneden sonra boşluk ekle
            }
            yeniDeger += deger[i];
        }
        $(this).val(yeniDeger); // Biçimlenmiş değeri girdiye yazdır (DOM Müdahalesi)
    });

    // =====================================================================================
    // KRİTER 3: FORM DOĞRULAMA (Form Validation) - İletişim Formu
    // HTML formundaki 'required' vb. tüm otomatik nitelikler kaldırılmış, kontrol tamamen
    // JS/jQuery tarafına devredilmiştir. Form submit edildiğinde alan doğruluğu kontrol edilir.
    // =====================================================================================
    $('#iletisimFormu').on('submit', function(e) {
        e.preventDefault(); // Sayfa yenilenmesini (postback) engeller

        let ad = $('#iletisim-ad').val().trim();
        let eposta = $('#iletisim-eposta').val().trim();
        let mesaj = $('#iletisim-mesaj').val().trim();
        let hataMesajiContainer = $('#form-hata-mesaji');
        let hatalar = [];

        // Ad Soyad ve Mesaj alanlarının boş olup olmadığının kontrolü
        if (ad === "") hatalar.push("Lütfen adınızı giriniz.");
        if (mesaj === "") hatalar.push("Lütfen mesajınızı giriniz.");

        // E-posta adresi için Düzenli İfade (RegEx) Kontrolü
        let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (eposta === "") {
            hatalar.push("Lütfen e-posta adresinizi giriniz.");
        } else if (!emailRegex.test(eposta)) {
            hatalar.push("Lütfen geçerli bir e-posta adresi giriniz.");
        }

        // =====================================================================================
        // KRİTER 3 & 4: FORM HATA MESAJININ ANİMASYONLA GÖSTERİLMESİ
        // Hata dizisinde mesajlar varsa, bunlar toparlanarak hata kutusuna yazılır ve jQuery
        // slideDown() efekti ile animasyonlu olarak aşağıya doğru açılır. Hata yoksa gizlenir (slideUp).
        // =====================================================================================
        if (hatalar.length > 0) {
            hataMesajiContainer.html(hatalar.join('<br>')).slideDown(300);
        } else {
            hataMesajiContainer.slideUp(300);
            const buton = $(this).find('.gonder-butonu');
            
            // DOM Müdahalesi: Gönderiliyor durumu için buton metni ve stili dinamik değiştirilir
            buton.css({'background': '#2d5016', 'color': '#fff'}).text('⏳ Gönderiliyor...');

            setTimeout(() => {
                alert("✅ Mesajınız başarıyla bize ulaştı! En kısa sürede dönüş yapacağız.");
                $('#iletisimFormu')[0].reset(); // Form alanlarını temizler
                buton.css({'background': '#d4af37', 'color': '#1a3a0a'}).text('📨 Mesajı Gönder');
            }, 1200);
        }
    });

    // =====================================================================================
    // KRİTER 3: FORM DOĞRULAMA (Form Validation) - Satın Alma ve Ödeme Formu
    // Kredi kartı, son kullanma tarihi, CVV ve adres alanları için istemci taraflı doğrulama.
    // =====================================================================================
    $('#odeme-formu').on('submit', function(e) {
        e.preventDefault(); // Form postback'ini önler

        let ad = $('#satinal-ad').val().trim();
        let eposta = $('#satinal-eposta').val().trim();
        let adres = $('#satinal-adres').val().trim();
        let kartisim = $('#satinal-kartisim').val().trim();
        let kartno = $('#satinal-kartno').val().trim();
        let skt = $('#satinal-skt').val().trim();
        let cvv = $('#satinal-cvv').val().trim();
        
        let hataMesajiContainer = $('#satinal-hata-mesaji');
        let hatalar = [];

        // Boş alan kontrolleri
        if (ad === "" || adres === "" || kartisim === "") {
            hatalar.push("Lütfen tüm metin alanlarını doldurunuz.");
        }
        
        // E-posta biçim denetimi
        let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(eposta)) {
            hatalar.push("Geçerli bir e-posta giriniz.");
        }

        // Karakter uzunluğu ve format kontrolleri
        if (kartno.replace(/\s/g, '').length < 16) {
            hatalar.push("Kart numarası en az 16 hane olmalıdır.");
        }
        if (skt.length < 5) {
            hatalar.push("Son kullanma tarihi AA/YY formatında olmalıdır.");
        }
        if (cvv.length < 3) {
            hatalar.push("CVV kodu 3 hane olmalıdır.");
        }

        // Hata gösterim veya onaylama süreci
        if (hatalar.length > 0) {
            hataMesajiContainer.html(hatalar.join('<br>')).slideDown(300); // Kriter 4: slideDown animasyonu
        } else {
            hataMesajiContainer.slideUp(300); // Kriter 4: slideUp animasyonu
            const buton = $(this).find('.onay-butonu');
            
            // DOM Müdahalesi: Buton görünümünü işlem sürecinde değiştirir
            buton.css({'background': '#2d5016', 'color': '#fff'}).text('⏳ İşleniyor...');

            setTimeout(() => {
                alert("🎉 Siparişiniz başarıyla alındı! Avınız kanlı olsun.");
                localStorage.removeItem('sepetVerisi'); // Sepeti boşaltır
                window.location.href = "index.html"; // Ana sayfaya yönlendirir
            }, 1500);
        }
    });

    // =====================================================================================
    // KRİTER 5: DİNAMİK SEPET İÇERİĞİ YÖNETİMİ
    // Sepet sayfasındaki sepet verileri localStorage'dan çekilir ve DOM'a dinamik olarak
    // listeler halinde basılır. Toplam fiyat anlık hesaplanır.
    // =====================================================================================
    const sepetIcerigi = $('#sepet-icerigi');
    if (sepetIcerigi.length) {
        sepetiYukle();
    }

    function sepetiYukle() {
        const sepet = JSON.parse(localStorage.getItem('sepetVerisi')) || [];
        sepetIcerigi.empty(); // Mevcut listeyi temizler
        
        if (sepet.length === 0) {
            // Kriter 4: Boş sepet mesajı fadeIn() animasyonuyla gösterilir
            sepetIcerigi.html('<div class="bos-sepet-mesaji" style="display:none;">🕸️ Sepetinizde henüz av malzemesi bulunmuyor.</div>');
            $('.bos-sepet-mesaji').fadeIn(500);
            return;
        }
        
        let toplamFiyat = 0;
        const liste = $('<ul></ul>');
        
        // Sepetteki ürünler listeleniyor
        sepet.forEach((urun, indeks) => {
            const miktar = urun.adet || 1;
            let islenmisFiyat = urun.fiyat ? urun.fiyat.replace('₺', '').replace(',', '').trim() : "0";
            toplamFiyat += (parseInt(islenmisFiyat) || 0) * miktar;

            const listeElemani = $(`
                <li style="display:none;">
                    <img src="${urun.resim}" alt="Ürün" style="width: 80px; height: 80px; object-fit: contain;">
                    <div class="urun-detaylari">
                        <span class="urun-adi">${urun.isim}</span>
                        <span class="urun-fiyati">${urun.fiyat || 'Fiyat Belirtilmemiş'}</span>
                    </div>
                    <div class="aksiyon-kapsayici">
                        <div class="miktar-kontrolleri">
                            <button class="miktar-butonu eksi-butonu" data-indeks="${indeks}">-</button>
                            <span class="miktar-gostergesi">${miktar}</span>
                            <button class="miktar-butonu arti-butonu" data-indeks="${indeks}">+</button>
                        </div>
                        <button class="kaldir-butonu" data-indeks="${indeks}">Kaldır</button>
                    </div>
                </li>
            `);
            liste.append(listeElemani);
        });
        
        sepetIcerigi.append(liste);
        
        // =====================================================================================
        // KRİTER 4: JQUERY ANİMASYONLARI
        // Sepetteki ürün satırları sayfada tek tek delay() kullanılarak fadeIn() animasyonuyla açılır.
        // =====================================================================================
        liste.find('li').each(function(i) {
            $(this).delay(100 * i).fadeIn(400);
        });
        
        const formatlanmisToplam = toplamFiyat.toLocaleString('tr-TR');
        const sepetAltBilgi = $(`
            <div class="sepet-alt-bilgi" style="display:none;">
                <div class="toplam-fiyat">Toplam: ₺${formatlanmisToplam}</div>
                <button class="temizle-butonu" id="sepetiTemizleButonu">🗑️ Sepeti Tamamen Boşalt</button>
            </div>
        `);
        
        sepetIcerigi.append(sepetAltBilgi);
        sepetAltBilgi.fadeIn(800); // Alt bilgi panelinin animasyonlu görünümü
    }

    // =====================================================================================
    // KRİTER 2: DOM OLAY YÖNETİMİ - SEPET ETKİLEŞİMLERİ (Event Delegation)
    // Sepeti tamamen boşaltma butonu olay dinleyicisi.
    // =====================================================================================
    $(document).on('click', '#sepetiTemizleButonu', function() {
        localStorage.removeItem('sepetVerisi');
        sepetiYukle(); 
    });

    // =====================================================================================
    // KRİTER 2 & 4: ÜRÜN KALDIRMA OLAYI VE SİLİNME ANİMASYONU
    // Sepetten ürün silerken slideUp() animasyonu uygulanarak eleman görsel olarak kapatılır,
    // ardından DOM'dan silinerek veri güncellenir.
    // =====================================================================================
    $(document).on('click', '.kaldir-butonu', function() {
        const indeks = parseInt($(this).attr('data-indeks'));
        const listeElemani = $(this).closest('li');
        const sepet = JSON.parse(localStorage.getItem('sepetVerisi')) || [];
        
        // jQuery slideUp animasyonlu silme efekti
        listeElemani.slideUp(300, function() {
            sepet.splice(indeks, 1);
            localStorage.setItem('sepetVerisi', JSON.stringify(sepet));
            sepetiYukle(); 
        });
    });

    // Miktar Artırma butonu olay dinleyicisi
    $(document).on('click', '.arti-butonu', function() {
        const indeks = parseInt($(this).attr('data-indeks'));
        const sepet = JSON.parse(localStorage.getItem('sepetVerisi')) || [];
        sepet[indeks].adet = (sepet[indeks].adet || 1) + 1;
        localStorage.setItem('sepetVerisi', JSON.stringify(sepet));
        sepetiYukle(); 
    });

    // Miktar Azaltma butonu olay dinleyicisi
    $(document).on('click', '.eksi-butonu', function() {
        const indeks = parseInt($(this).attr('data-indeks'));
        const sepet = JSON.parse(localStorage.getItem('sepetVerisi')) || [];
        if ((sepet[indeks].adet || 1) > 1) {
            sepet[indeks].adet -= 1;
            localStorage.setItem('sepetVerisi', JSON.stringify(sepet));
            sepetiYukle(); 
        } else {
            // =====================================================================================
            // KRİTER 4: JQUERY DOM GEZİNMESİ (Traversal - parent ve siblings kullanımı)
            // parent() metodu ile .miktar-kontrolleri sarmalayıcısına çıkılır, oradan siblings() ile
            // kardeş eleman olan .kaldir-butonu seçilerek görsel uyarı animasyonu verilir.
            // =====================================================================================
            const miktarKontrol = $(this).parent(); // parent() metodu ile bir üst öğeye çıkıldı
            const kaldirButonu = miktarKontrol.siblings('.kaldir-butonu'); // siblings() metodu ile kardeş kaldir-butonu seçildi
            kaldirButonu.css('transform', 'scale(1.1)');
            setTimeout(() => kaldirButonu.css('transform', 'scale(1)'), 200);
        }
    });

});
