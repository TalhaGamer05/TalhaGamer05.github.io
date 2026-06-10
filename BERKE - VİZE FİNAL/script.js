$(document).ready(function() {

    // ==========================================
    // 1. GENEL AYARLAR VE GEÇİŞ ANIMASYONLARI
    // ==========================================
    
    // Sayfa ilk yüklendiğinde gövdeyi yavaşça göster
    $('body').hide().fadeIn(400);

    // Link geçişlerinde fadeOut animasyonu uygulayarak sayfadan çık
    $('nav a, .btn').on('click', function(e) {
        let targetUrl = $(this).attr('href');
        if (targetUrl && targetUrl !== '#' && !targetUrl.startsWith('javascript')) {
            e.preventDefault();
            $('body').fadeOut(300, function() {
                window.location.href = targetUrl;
            });
        }
    });

    // ==========================================
    // 2. NAVİGASYON KORUYUCULARI (GUARD) & VERİ ÇEKME
    // ==========================================
    
    let path = window.location.pathname;

    // Vize verilerini kontrol et
    let savedDersAdi = localStorage.getItem("dersAdi");
    let savedVize = localStorage.getItem("vize");
    let savedVizeOran = localStorage.getItem("vizeOran");
    let savedFinal = localStorage.getItem("final");
    let savedFinalOran = localStorage.getItem("finalOran");

    // Adımları atlama koruması
    if (path.includes('final.html')) {
        if (!savedVize || !savedVizeOran) {
            window.location.href = "vize.html";
            return;
        }
        // Vize özet bilgisini yazdır
        let displayDers = savedDersAdi ? `Ders: <strong>${savedDersAdi}</strong> | ` : "";
        $('#vizeOzet').html(`${displayDers}Vize: <strong>${savedVize} (%${savedVizeOran})</strong>`);
        // Final oranını otomatik doldur
        let computedFinalOran = 100 - Number(savedVizeOran);
        $('#finalOran').val(computedFinalOran);
        localStorage.setItem("finalOran", computedFinalOran);
        
        // Hedef Not Rehberini hesapla ve göster
        hesaplaHedefNotlar(Number(savedVize), Number(savedVizeOran), computedFinalOran);
    } 
    
    else if (path.includes('hesapla.html')) {
        if (!savedVize || !savedVizeOran || !savedFinal || !savedFinalOran) {
            window.location.href = "vize.html";
            return;
        }
        // Hesapla sayfasındaki özeti doldur
        $('#sumDersAdi').text(savedDersAdi || "Belirtilmedi (Opsiyonel)");
        $('#sumVize').html(`${savedVize} <span style="color:var(--secondary-color)">(%${savedVizeOran} etki)</span>`);
        $('#sumFinal').html(`${savedFinal} <span style="color:var(--secondary-color)">(%${savedFinalOran} etki)</span>`);
    } 
    
    else if (path.includes('sonuc.html')) {
        let sonGuncel = JSON.parse(localStorage.getItem("sonGuncelSonuc"));
        if (!sonGuncel) {
            // Eğer yeni hesaplanan bir sonuç yoksa geçmişe bak, o da boşsa vizeye yolla
            let gecmis = getGecmisDizi();
            if (gecmis.length === 0) {
                window.location.href = "vize.html";
                return;
            } else {
                // Son geçmiş kaydını göster
                sonGuncel = gecmis[gecmis.length - 1];
            }
        }
        
        // Son sonucu ekrana bas
        $('#dersBilgiBaslik').html(`Ders: <strong>${sonGuncel.dersAdi || "Belirtilmedi"}</strong>`);
        $('#vize').text(sonGuncel.vizeNot);
        $('#vizeOran').text(`%${sonGuncel.vizeOran}`);
        $('#final').text(sonGuncel.finalNot);
        $('#finalOran').text(`%${sonGuncel.finalOran}`);
        $('#sonuc').text(sonGuncel.ort);
        $('#harf').text(sonGuncel.harfNotu);
        
        // Harfe göre renk ataması yap
        if (sonGuncel.harfNotu === "FF") {
            $('#harf').css("color", "var(--error-color)");
        } else {
            $('#harf').css("color", "var(--success-color)");
        }

        // İlerleme çubuğunu doldur
        let ortalamaDegeri = Number(sonGuncel.ort);
        $('#progressPercent').text(`${ortalamaDegeri.toFixed(1)}%`);
        setTimeout(function() {
            $('#progress').css("width", ortalamaDegeri + "%");
            if (ortalamaDegeri < 50) {
                $('#progress').css("background", "linear-gradient(90deg, var(--error-color), #f87171)");
            } else if (ortalamaDegeri < 70) {
                $('#progress').css("background", "linear-gradient(90deg, var(--warning-color), #fbbf24)");
            } else {
                $('#progress').css("background", "linear-gradient(90deg, var(--success-color), #34d399)");
            }
        }, 300);

        // Performans analiz metnini ata
        belirlePerformansMesaji(ortalamaDegeri, sonGuncel.harfNotu, sonGuncel.dersAdi || "Ders");

        // Geçmiş listeyi ve istatistikleri yükle
        yukleGecmisVeIstatistikler();
    }

    // ==========================================
    // 3. LEGACY VERİ ONARIMI VE GÜVENLİ OKUMA
    // ==========================================
    
    function getGecmisDizi() {
        let gecmis = JSON.parse(localStorage.getItem("hesaplamaGecmisi")) || [];
        let updated = false;
        
        // Eski projeden kalan eksik alanlı verileri onar
        $.each(gecmis, function(index, item) {
            if (!item.id) {
                item.id = Date.now() + index; // Benzersiz geçici ID
                updated = true;
            }
            if (item.dersAdi === undefined) {
                item.dersAdi = ""; // Eksik ders adı alanını tanımla
                updated = true;
            }
        });
        
        if (updated) {
            localStorage.setItem("hesaplamaGecmisi", JSON.stringify(gecmis));
        }
        
        return gecmis;
    }

    // ==========================================
    // 4. ANLIK FORM DOĞRULAMA (INPUT VALIDATION)
    // ==========================================
    
    // Ders Adı için regex: Sadece harf ve boşluk, en az 3 karakter (opsiyonel doğrulama için)
    const regexDersAdi = /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]{3,}$/;

    function kontrolEtAlan($input, kosul) {
        let $group = $input.closest('.form-group');
        if ($input.val().trim() === "") {
            $group.removeClass('valid invalid');
        } else if (kosul) {
            $group.addClass('valid').removeClass('invalid');
        } else {
            $group.addClass('invalid').removeClass('valid');
        }
    }

    // Ders Adı - Opsiyonel ama girilirse en az 3 harf ve rakamsız olmalı
    $('#dersAdi').on('input keyup', function() {
        let val = $(this).val().trim();
        if (val.length > 0) {
            kontrolEtAlan($(this), regexDersAdi.test(val));
        } else {
            $(this).closest('.form-group').removeClass('valid invalid');
        }
    });

    // Vize Sayfası Anlık Doğrulama
    $('#vize').on('input keyup', function() {
        let val = $(this).val();
        let num = Number(val);
        kontrolEtAlan($(this), val !== "" && !isNaN(val) && num >= 0 && num <= 100);
    });

    // Vize Oranı Anlık Doğrulama
    $('#vizeOran').on('input keyup', function() {
        let val = $(this).val();
        let num = Number(val);
        kontrolEtAlan($(this), val !== "" && !isNaN(val) && num > 0 && num < 100);
    });

    // Final Sayfası Anlık Doğrulama
    $('#final').on('input keyup', function() {
        let val = $(this).val();
        let num = Number(val);
        kontrolEtAlan($(this), val !== "" && !isNaN(val) && num >= 0 && num <= 100);
    });

    // ==========================================
    // 5. FORM GÖNDERME KONTROLLERİ (SUBMIT)
    // ==========================================
    
    // Vize Formu Submit
    $('#vizeForm').on('submit', function(e) {
        e.preventDefault();
        
        let dersAdi = $('#dersAdi').val().trim();
        let vize = $('#vize').val();
        let vizeOran = $('#vizeOran').val();

        // Validasyon kontrolleri
        let hataMesaji = "";
        
        if (dersAdi !== "" && !regexDersAdi.test(dersAdi)) {
            hataMesaji = "Ders adı en az 3 harften oluşmalı ve rakam içermemelidir!";
            $('#dersAdi').closest('.form-group').addClass('invalid');
        } else if (vize === "" || isNaN(vize) || Number(vize) < 0 || Number(vize) > 100) {
            hataMesaji = "Vize notu 0 ile 100 arasında olmalıdır!";
            $('#vize').closest('.form-group').addClass('invalid');
        } else if (vizeOran === "" || isNaN(vizeOran) || Number(vizeOran) <= 0 || Number(vizeOran) >= 100) {
            hataMesaji = "Vize etki oranı %1 ile %99 arasında olmalıdır!";
            $('#vizeOran').closest('.form-group').addClass('invalid');
        }

        if (hataMesaji !== "") {
            $('#vizeHata').text(hataMesaji).slideDown();
        } else {
            $('#vizeHata').slideUp();
            localStorage.setItem("dersAdi", dersAdi);
            localStorage.setItem("vize", vize);
            localStorage.setItem("vizeOran", vizeOran);
            
            $('body').fadeOut(300, function() {
                window.location.href = "final.html";
            });
        }
    });

    // Final Formu Submit
    $('#finalForm').on('submit', function(e) {
        e.preventDefault();
        
        let final = $('#final').val();
        let finalOran = $('#finalOran').val();

        let hataMesaji = "";

        if (final === "" || isNaN(final) || Number(final) < 0 || Number(final) > 100) {
            hataMesaji = "Final notu 0 ile 100 arasında olmalıdır!";
            $('#final').closest('.form-group').addClass('invalid');
        }

        if (hataMesaji !== "") {
            $('#finalHata').text(hataMesaji).slideDown();
        } else {
            $('#finalHata').slideUp();
            localStorage.setItem("final", final);
            localStorage.setItem("finalOran", finalOran);
            
            $('body').fadeOut(300, function() {
                window.location.href = "hesapla.html";
            });
        }
    });

    // ==========================================
    // 6. HEDEF NOT HESAPLAMA SİSTEMİ
    // ==========================================
    
    function hesaplaHedefNotlar(vizeVal, vizeOranVal, finalOranVal) {
        let hedefler = [
            { harf: "DD (Geçer)", bar: 50 },
            { harf: "CC (Orta)", bar: 60 },
            { harf: "BB (İyi)", bar: 70 },
            { harf: "AA (Pekiyi)", bar: 85 }
        ];

        let html = "";
        let vizeKatkisi = vizeVal * vizeOranVal / 100;
        
        $.each(hedefler, function(index, target) {
            let gerekenFinal = (target.bar - vizeKatkisi) / (finalOranVal / 100);
            
            if (gerekenFinal <= 0) {
                html += `<div class="target-card">
                    <div class="grade-letter">${target.harf.split(' ')[0]}</div>
                    <div class="grade-val" style="color:var(--success-color);">Garanti (0.0)</div>
                    <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Gerek kalmadı</div>
                </div>`;
            } else if (gerekenFinal > 100) {
                html += `<div class="target-card impossible">
                    <div class="grade-letter">${target.harf.split(' ')[0]}</div>
                    <div class="grade-val">İmkansız</div>
                    <div style="font-size:0.75rem; color:rgba(255,255,255,0.4); margin-top:2px;">(100+ Gerekli)</div>
                </div>`;
            } else {
                html += `<div class="target-card">
                    <div class="grade-letter">${target.harf.split(' ')[0]}</div>
                    <div class="grade-val">${gerekenFinal.toFixed(1)}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">ve üzeri</div>
                </div>`;
            }
        });
        
        $('#targetGrid').html(html);
        $('#hedefKartlari').slideDown(500);
    }

    // ==========================================
    // 7. HESAPLAMA EKRANI AKSİYONLARI (CONFIRMATION)
    // ==========================================
    
    $('#btnHesapla').on('click', function() {
        let vize = Number(localStorage.getItem("vize"));
        let vizeOran = Number(localStorage.getItem("vizeOran"));
        let final = Number(localStorage.getItem("final"));
        let finalOran = Number(localStorage.getItem("finalOran"));
        let dersAdi = localStorage.getItem("dersAdi");

        // Hesapla
        let ortalama = (vize * vizeOran / 100) + (final * finalOran / 100);
        let harf = "";
        
        if (ortalama >= 85) harf = "AA";
        else if (ortalama >= 70) harf = "BB";
        else if (ortalama >= 60) harf = "CC";
        else if (ortalama >= 50) harf = "DD";
        else harf = "FF";

        // Obje oluştur (Benzersiz ID ile)
        let islemSonucu = { 
            id: Date.now(),
            dersAdi: dersAdi || "", 
            vizeNot: vize, 
            vizeOran: vizeOran,
            finalNot: final, 
            finalOran: finalOran,
            ort: ortalama.toFixed(2), 
            harfNotu: harf 
        };

        // Geçmiş listesine ekle
        let gecmis = getGecmisDizi();
        gecmis.push(islemSonucu);
        
        localStorage.setItem("sonGuncelSonuc", JSON.stringify(islemSonucu));
        localStorage.setItem("hesaplamaGecmisi", JSON.stringify(gecmis));

        $('#hesaplaMesajAlani').html('<p style="color:var(--secondary-color); font-weight:600;">Ortalama hesaplandı! Rapor hazırlanıyor...</p>');
        
        setTimeout(function() {
            $('body').fadeOut(300, function() {
                window.location.href = "sonuc.html";
            });
        }, 800);
    });

    $('#btnSifirla').on('click', function() {
        localStorage.removeItem("dersAdi");
        localStorage.removeItem("vize");
        localStorage.removeItem("vizeOran");
        localStorage.removeItem("final");
        localStorage.removeItem("finalOran");
        localStorage.removeItem("sonGuncelSonuc");

        let $btnGroup = $(this).parent();
        let $infoTable = $btnGroup.siblings('.table-container');
        
        $infoTable.slideUp(400);
        $btnGroup.fadeOut(300, function() {
            $('#hesaplaMesajAlani').html('<p style="color:#ffb3b3; font-weight:600; text-align:center;">Veriler sıfırlandı! Yeni hesaplamaya yönlendiriliyorsunuz...</p>');
            setTimeout(function() {
                $('body').fadeOut(300, function() {
                    window.location.href = "vize.html";
                });
            }, 1200);
        });
    });

    // ==========================================
    // 8. SONUÇ EKRANI PERFORMANS ANALİZLERİ
    // ==========================================
    
    function belirlePerformansMesaji(ort, harf, ders) {
        let title = "";
        let text = "";
        let dersIsim = ders === "" ? "Dersinizi" : `<strong>${ders}</strong> dersini`;
        let dersIsimYalin = ders === "" ? "Bu dersten" : `<strong>${ders}</strong> dersinden`;

        switch (harf) {
            case "AA":
                title = "🎉 Olağanüstü Başarı!";
                text = `${dersIsim} <strong>AA</strong> harf notu ve <strong>${ort.toFixed(2)}</strong> mükemmel ortalamayla tamamladınız. Akademik kariyeriniz için harika bir sonuç! Başarılarınızın devamını dileriz.`;
                break;
            case "BB":
                title = "✨ Harika Performans!";
                text = `${dersIsimYalin} <strong>BB</strong> harf notu alarak <strong>${ort.toFixed(2)}</strong> gibi yüksek bir ortalamayla geçtiniz. Emeklerinizin karşılığını fazlasıyla aldınız. Tebrikler!`;
                break;
            case "CC":
                title = "👍 Başarıyla Geçtiniz!";
                text = `${dersIsimYalin} <strong>CC</strong> harf notu aldınız ve <strong>${ort.toFixed(2)}</strong> ortalamayla başarıyla tamamladınız. Dengeli ve kararlı çalışmanızın güzel bir sonucu.`;
                break;
            case "DD":
                title = "⚠️ Sınırda Geçiş!";
                text = `${dersIsim} <strong>DD</strong> harf notu ve <strong>${ort.toFixed(2)}</strong> ortalamayla geçtiniz. Sınırı geçmiş olsanız da, gelecek dönemlerdeki ortalamanızı yüksek tutmak için not etki oranlarına daha fazla dikkat etmenizi öneririz.`;
                break;
            case "FF":
                title = "😢 Kaldınız!";
                text = `${dersIsimYalin} <strong>FF</strong> harf notu ve <strong>${ort.toFixed(2)}</strong> ortalamayla maalesef kaldınız. Pes etmeyin! Bu sonucu bir deneyim olarak görüp, gelecek sınavlarda not ağırlıklarını planlayarak kesinlikle başarıya ulaşabilirsiniz.`;
                break;
        }

        $('#feedbackTitle').html(title);
        $('#feedbackText').html(text);
    }

    // ==========================================
    // 9. DİNAMİK GEÇMİŞ TABLOSU VE İSTATİSTİKLER
    // ==========================================
    
    // Geçmişi ilk yükleme fonksiyonu
    function yukleGecmisVeIstatistikler() {
        let gecmis = getGecmisDizi();
        let tableRowsHtml = "";

        if (gecmis.length > 0) {
            $.each(gecmis, function(index, item) {
                let dersIsmi = item.dersAdi || "İsimsiz Ders";
                tableRowsHtml += `<tr data-id="${item.id}">
                    <td style="font-weight:600;">${dersIsmi}</td>
                    <td>${item.vizeNot} <span style="font-size:0.78rem; opacity:0.7">(%${item.vizeOran})</span></td>
                    <td>${item.finalNot} <span style="font-size:0.78rem; opacity:0.7">(%${item.finalOran})</span></td>
                    <td style="font-weight:700;">${item.ort}</td>
                    <td style="font-weight:800; color:${item.harfNotu === "FF" ? "var(--error-color)" : "var(--success-color)"}">${item.harfNotu}</td>
                    <td>
                        <button class="btn btn-danger btn-sil" data-id="${item.id}" style="padding:6px 12px; font-size:0.8rem; border-radius:8px;">Sil ✕</button>
                    </td>
                </tr>`;
            });

            $('#gecmisBody').html(tableRowsHtml);
            $('#gecmisTablo').closest('.table-container').show();
            $('#gecmisBosMesaj').hide();
        } else {
            $('#gecmisTablo').closest('.table-container').hide();
            $('#gecmisBosMesaj').show();
        }

        // İstatistik kartlarını güncelle
        guncelleIstatistikler();
    }

    // Sadece istatistikleri ve boş durumu güncelleyen hafif fonksiyon (UI atlamalarını engeller)
    function guncelleIstatistikler() {
        let gecmis = getGecmisDizi();
        let dersSayisi = gecmis.length;
        let toplamOrtalama = 0;
        let basariliDersSayisi = 0;

        if (dersSayisi > 0) {
            $.each(gecmis, function(index, item) {
                toplamOrtalama += Number(item.ort);
                if (item.harfNotu !== "FF") {
                    basariliDersSayisi++;
                }
            });

            let genelOrt = toplamOrtalama / dersSayisi;
            let basariYuzdesi = (basariliDersSayisi / dersSayisi) * 100;

            $('#statDersSayisi').text(dersSayisi);
            $('#statGenelOrtalama').text(genelOrt.toFixed(2));
            $('#statBasariOrani').text(Math.round(basariYuzdesi) + "%");
            
            $('#gecmisTablo').closest('.table-container').show();
            $('#gecmisBosMesaj').hide();
        } else {
            $('#statDersSayisi').text("0");
            $('#statGenelOrtalama').text("0.00");
            $('#statBasariOrani').text("0%");
            
            $('#gecmisTablo').closest('.table-container').hide();
            $('#gecmisBosMesaj').show();
        }
    }

    // Silme Butonu Olayı (Event Delegation ile) - Sayfa açıldığında 1 kez bağlanır
    $(document).on('click', '.btn-sil', function() {
        let idToDel = $(this).attr('data-id');
        let $row = $(this).closest('tr'); // Parent satırı bul (DOM Traversal)
        
        // localStorage'dan sil
        let gecmisGuncel = getGecmisDizi();
        gecmisGuncel = $.grep(gecmisGuncel, function(item) {
            return item.id != idToDel; // ID eşleşmiyorsa dizide tut (eşleşen silinir)
        });
        localStorage.setItem("hesaplamaGecmisi", JSON.stringify(gecmisGuncel));
        
        // Eğer silinen kayıt son hesaplanan ise güncel sonucu da temizle
        let sonGuncel = JSON.parse(localStorage.getItem("sonGuncelSonuc"));
        if (sonGuncel && sonGuncel.id == idToDel) {
            localStorage.removeItem("sonGuncelSonuc");
        }

        // Satırı fadeOut animasyonu ile DOM'dan kaldır ve istatistikleri güncelle
        $row.fadeOut(400, function() {
            $row.remove();
            guncelleIstatistikler(); // Yeniden tablo çizmeden sadece istatistikleri ve boş-durumu kontrol et
        });
    });

    // ==========================================
    // 10. HARF SKALASI MODAL (LIGHTBOX) ETKİLEŞİMİ
    // ==========================================
    
    // Modalı aç
    $('#btnAcModal').on('click', function() {
        $('#rubricModal').addClass('active').hide().fadeIn(300);
    });

    // Modalı kapat
    $('#btnKapatModal').on('click', function() {
        $('#rubricModal').fadeOut(200, function() {
            $(this).removeClass('active');
        });
    });

    // Modal dışına tıklayınca kapat
    $(window).on('click', function(e) {
        if ($(e.target).is('#rubricModal')) {
            $('#rubricModal').fadeOut(200, function() {
                $(this).removeClass('active');
            });
        }
    });

    // ==========================================
    // 11. JQUERY SLICK SLIDER ETKİNLEŞTİRME
    // ==========================================
    
    if ($('.hero-image-slider').length) {
        $('.hero-image-slider').slick({
            autoplay: true,
            autoplaySpeed: 3500,
            dots: true,
            arrows: false,
            fade: true,
            cssEase: 'linear'
        });
    }

    // ==========================================
    // 12. MOUSEENTER / MOUSELEAVE (MICRO-INTERACTIONS)
    // ==========================================
    
    // Buton ve girdilere odaklanıldığında veya üzerine gelindiğinde mikro hareketler
    $('button, .btn, nav a').on('mouseenter', function() {
        $(this).css({
            'transform': 'translateY(-2px)',
            'transition': 'all 0.2s ease'
        });
    }).on('mouseleave', function() {
        $(this).css({
            'transform': 'translateY(0)'
        });
    });

});
