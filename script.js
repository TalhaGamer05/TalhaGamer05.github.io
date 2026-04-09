document.addEventListener('DOMContentLoaded', async () => {
    const projectsContainer = document.getElementById('projects-container');
    const loading = document.getElementById('loading');
    
    // Varsayılan / Fallback projeler (Eğer API çekilemezse veya local'de çalıştırılıyorsa)
    // Sadece klasör adını ekleyin.
    const fallbackProjects = [
        'havadurumu',
        'avmarket',
        'snake'
    ];
    
    try {
        // GitHub API'sini kullanarak bu deponun kök dizinindeki klasörleri çeker
        // 'TalhaGamer05/TalhaGamer05.github.io' kullanıcının repo adresi olduğu öngörülmüştür.
        const response = await fetch('https://api.github.com/repos/TalhaGamer05/TalhaGamer05.github.io/contents/');
        
        if (!response.ok) {
            throw new Error('API Hatası veya Rate Limit Görüldü');
        }
        
        const data = await response.json();
        
        // Sadece klasörleri filtrele ve gizli klasörleri atla (örn .git, .github vb.)
        const projects = data.filter(item => item.type === 'dir' && !item.name.startsWith('.'));
        
        loading.style.display = 'none';
        
        if (projects.length === 0) {
            projectsContainer.innerHTML = '<p style="color:var(--text-muted); grid-column: 1/-1; text-align:center;">Henüz bir proje bulunmuyor.</p>';
            return;
        }

        projects.forEach((project, index) => {
            const card = createProjectCard(project.name, index);
            projectsContainer.appendChild(card);
        });

    } catch (error) {
        console.warn('GitHub API üzerinden projeler çekilemedi veya Local ortam. Fallback yapılandırması kullanılıyor:', error);
        
        loading.style.display = 'none';
        
        fallbackProjects.forEach((proj, index) => {
            const card = createProjectCard(proj, index);
            projectsContainer.appendChild(card);
        });
    }
});

function createProjectCard(folderName, index) {
    const a = document.createElement('a');
    // Eğer her projenin standart bir index.html dosyası varsa
    a.href = `${folderName}/index.html`; 
    a.className = 'project-card';
    a.style.animationDelay = `${index * 0.1}s`;

    // Klasör adını daha düzgün bir başlığa çevir: 
    // Örn: hava-durumu -> Hava Durumu
    // Örn: havadurumu -> Havadurumu
    const formattedName = folderName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    a.innerHTML = `
        <div class="card-content">
            <div class="icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
            </div>
            <h3>${formattedName}</h3>
            <p>Projeyi Görüntüle</p>
        </div>
    `;

    // Mouse imleci ile hareket eden Glow Efekti (Glassmorphism kart için)
    a.addEventListener('mousemove', (e) => {
        const rect = a.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        a.style.setProperty('--mouse-x', `${x}px`);
        a.style.setProperty('--mouse-y', `${y}px`);
    });

    return a;
}
