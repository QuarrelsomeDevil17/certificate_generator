// Certificate Generator - Main JavaScript File
class CertificateGenerator {
    constructor() {
        this.canvases = [];
        this.certificateData = {};
        this.designs = this.getPredefinedDesigns();
        this.currentSlide = 0;
        this.totalSlides = 5;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const generateBtn = document.getElementById('generateBtn');
        generateBtn.addEventListener('click', () => this.generateCertificates());
        
        // Add input listeners for real-time validation feedback
        const inputs = ['categoryName', 'recipientName', 'organizationName'];
        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            input.addEventListener('input', () => this.updateGenerateButtonState());
        });
        
        // Initial button state check
        this.updateGenerateButtonState();
    }

    updateGenerateButtonState() {
        const generateBtn = document.getElementById('generateBtn');
        const categoryName = document.getElementById('categoryName').value.trim();
        const recipientName = document.getElementById('recipientName').value.trim();
        const organizationName = document.getElementById('organizationName').value.trim();
        
        const hasAllFields = categoryName && recipientName && organizationName;
        
        if (hasAllFields) {
            generateBtn.textContent = '🎨 Generate 5 Certificate Designs';
            generateBtn.classList.remove('incomplete');
        } else {
            generateBtn.textContent = '🎨 Generate with Sample Data';
            generateBtn.classList.add('incomplete');
        }
    }

    collectFormData() {
        const categoryName = document.getElementById('categoryName').value.trim();
        const recipientName = document.getElementById('recipientName').value.trim();
        const organizationName = document.getElementById('organizationName').value.trim();
        const dateIssued = document.getElementById('dateIssued').value;
        
        // Show warning if required fields are empty
        if (!categoryName || !recipientName || !organizationName) {
            this.showFieldWarning();
        }
        
        return {
            categoryName: categoryName || 'Certificate of Achievement',
            recipientName: recipientName || 'Recipient Name',
            organizationName: organizationName || 'Organization Name',
            dateIssued: dateIssued || new Date().toISOString().split('T')[0],
            apiKey: this.getBuiltInApiKey() // Use built-in API key
        };
    }

    getBuiltInApiKey() {
        // Get API key from configuration file
        return window.CERTIFICATE_CONFIG?.OPENROUTER_API_KEY || 'YOUR_OPENROUTER_API_KEY_HERE';
    }

    showFieldWarning() {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'field-warning';
        warningDiv.innerHTML = `
            <p>⚠️ Some fields are empty. Default values will be used for missing information.</p>
        `;
        
        const container = document.getElementById('certificatesContainer');
        container.insertBefore(warningDiv, container.firstChild);
        
        // Remove warning after 5 seconds
        setTimeout(() => {
            if (warningDiv.parentNode) {
                warningDiv.parentNode.removeChild(warningDiv);
            }
        }, 5000);
    }

    async generateCertificates() {
        this.certificateData = this.collectFormData();
        
        const loadingDiv = document.getElementById('loadingDiv');
        const container = document.getElementById('certificatesContainer');
        
        // Show loading
        loadingDiv.classList.add('show');
        container.innerHTML = '';

        try {
            // Always try to enhance designs with AI
            this.showAIStatus('🤖 Enhancing designs with AI...');
            await this.enhanceDesignsWithAI();
            this.showAIStatus('✅ AI enhancements applied!', 'success');

            // Create the slider container
            this.createSliderContainer();

            // Generate 5 different certificate designs
            for (let i = 0; i < 5; i++) {
                await this.createCertificateDesign(i);
            }

            // Initialize slider functionality
            this.initializeSlider();

        } catch (error) {
            console.error('Error generating certificates:', error);
            container.innerHTML = '<div class="error">Error generating certificates. Please try again.</div>';
        } finally {
            loadingDiv.classList.remove('show');
        }
    }

    createSliderContainer() {
        const container = document.getElementById('certificatesContainer');
        
        const sliderHTML = `
            <div class="certificate-slider">
                <div class="slider-header">
                    <h2 class="slider-title">Certificate Designs</h2>
                    <div class="slider-counter">
                        <span id="currentSlide">1</span> / <span id="totalSlides">5</span>
                    </div>
                    <div class="slider-navigation">
                        <button class="nav-btn" id="prevBtn" onclick="generator.previousSlide()">‹</button>
                        <button class="nav-btn" id="nextBtn" onclick="generator.nextSlide()">›</button>
                    </div>
                </div>
                <div class="slider-content" id="sliderContent">
                    <!-- Slides will be inserted here -->
                </div>
            </div>
        `;
        
        container.innerHTML = sliderHTML;
    }

    showAIStatus(message, type = 'info') {
        // Remove existing status message
        const existingStatus = document.querySelector('.ai-status');
        if (existingStatus) {
            existingStatus.remove();
        }

        // Create new status message
        const statusDiv = document.createElement('div');
        statusDiv.className = `ai-status ${type}`;
        statusDiv.innerHTML = `<p>${message}</p>`;
        
        const container = document.getElementById('certificatesContainer');
        container.insertBefore(statusDiv, container.firstChild);
        
        // Auto-remove success/error messages after 3 seconds
        if (type !== 'info') {
            setTimeout(() => {
                if (statusDiv.parentNode) {
                    statusDiv.parentNode.removeChild(statusDiv);
                }
            }, 3000);
        }
    }

    async enhanceDesignsWithAI() {
        try {
            console.log('Enhancing designs with AI for category:', this.certificateData.categoryName);
            
            // Call OpenRouter API to get enhanced content
            const enhancedContent = await this.callOpenRouter(this.certificateData.categoryName);
            
            if (enhancedContent) {
                // Apply AI enhancements to designs
                this.applyAIEnhancements(enhancedContent);
                console.log('AI enhancements applied successfully');
            }
        } catch (error) {
            console.error('AI enhancement failed:', error);
            this.showAIStatus('⚠️ AI enhancement failed. Using default designs.', 'error');
            // Continue with default designs if AI fails
        }
    }

    async callOpenRouter(categoryName) {
        const apiKey = this.certificateData.apiKey;
        
        if (!apiKey || apiKey === 'YOUR_OPENROUTER_API_KEY_HERE') {
            console.warn('Built-in API key not configured. Please set your OpenRouter API key in the getBuiltInApiKey() method.');
            return null;
        }

        const prompt = `You are a professional certificate designer. Generate creative and professional content for a certificate in the category "${categoryName}". 

        Create content that is:
        - Professional yet engaging
        - Specific to the category type
        - Suitable for formal certificates
        - Varied and creative (not generic)

        Please provide a JSON response with these keys:
        {
            "title": "A creative, specific title for this certificate (different from the category name)",
            "description": "A meaningful 1-2 sentence description of what this certificate represents or what the recipient achieved",
            "achievement": "A short phrase describing the type of achievement (e.g., 'Excellence in Innovation', 'Distinguished Performance')",
            "decorativeText": "An alternative certificate type heading (e.g., 'Certificate of Distinction', 'Award of Merit')"
        }

        Make the content specific to "${categoryName}" and avoid generic phrases. Be creative but professional.`;

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Certificate Generator'
                },
                body: JSON.stringify({
                    model: window.CERTIFICATE_CONFIG?.AI_MODEL || 'deepseek/deepseek-r1',
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: window.CERTIFICATE_CONFIG?.MAX_TOKENS || 500,
                    temperature: window.CERTIFICATE_CONFIG?.TEMPERATURE || 0.7
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                let errorMessage = `API request failed: ${response.status}`;
                
                if (response.status === 401) {
                    errorMessage = 'Invalid API key. Please check your OpenRouter API key.';
                } else if (response.status === 429) {
                    errorMessage = 'Rate limit exceeded. Please try again later.';
                } else if (response.status === 403) {
                    errorMessage = 'Access denied. Please check your API key permissions.';
                }
                
                throw new Error(errorMessage);
            }

            const data = await response.json();
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Invalid API response format');
            }
            
            const content = data.choices[0].message.content.trim();
            
            // Try to parse JSON response
            try {
                return JSON.parse(content);
            } catch (parseError) {
                // If not JSON, extract useful text anyway
                console.warn('Response not in JSON format, using text content');
                return {
                    title: this.certificateData.categoryName,
                    description: content.slice(0, 200),
                    achievement: 'Excellence and Dedication',
                    decorativeText: 'Distinguished Achievement'
                };
            }
        } catch (error) {
            console.error('OpenRouter API error:', error);
            throw error;
        }
    }

    applyAIEnhancements(enhancedContent) {
        // Update designs with AI-generated content
        this.designs.forEach(design => {
            if (enhancedContent.title && enhancedContent.title !== this.certificateData.categoryName) {
                design.aiTitle = enhancedContent.title;
            }
            if (enhancedContent.description) {
                design.aiDescription = enhancedContent.description;
            }
            if (enhancedContent.achievement) {
                design.aiAchievement = enhancedContent.achievement;
            }
            if (enhancedContent.decorativeText) {
                design.aiDecorative = enhancedContent.decorativeText;
            }
        });
    }

    async createCertificateDesign(designIndex) {
        const design = this.designs[designIndex];
        const sliderContent = document.getElementById('sliderContent');
        
        // Create certificate slide
        const certificateSlide = document.createElement('div');
        certificateSlide.className = `certificate-slide ${designIndex === 0 ? 'active' : ''}`;
        certificateSlide.id = `slide-${designIndex}`;

        certificateSlide.innerHTML = `
            <h3>🎨 Design ${designIndex + 1}: ${design.name}</h3>
            <div class="design-info">
                <h4>Design Description:</h4>
                <p>${design.description}</p>
            </div>
            <div class="canvas-container">
                <canvas id="canvas-${designIndex}" width="800" height="600"></canvas>
            </div>
            <div class="certificate-actions">
                <button class="download-btn" onclick="generator.downloadCertificate(${designIndex}, 'png')">
                    📥 Download PNG
                </button>
                <button class="download-btn" onclick="generator.downloadCertificate(${designIndex}, 'pdf')">
                    📄 Download PDF
                </button>
                <button class="copy-btn" onclick="generator.copyCanvasCode(${designIndex})">
                    📋 Copy Canvas.js Code
                </button>
            </div>
            <div class="code-section">
                <button class="code-toggle" onclick="generator.toggleCode(${designIndex})">
                    <span>📝 Canvas.js Implementation Code</span>
                    <span class="code-toggle-icon">▼</span>
                </button>
                <div class="code-content" id="code-content-${designIndex}">
                    <div class="code-block" id="code-${designIndex}">
                        <!-- Code will be inserted here -->
                    </div>
                </div>
            </div>
        `;

        sliderContent.appendChild(certificateSlide);

        // Initialize Fabric.js canvas
        await this.initializeCanvas(designIndex, design);
        
        // Generate and display the code
        this.displayCanvasCode(designIndex, design);
    }

    initializeSlider() {
        this.currentSlide = 0;
        this.updateSliderNavigation();
        
        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.previousSlide();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.nextSlide();
            }
        });
        
        // Add touch support for mobile
        this.initializeTouchSupport();
    }

    initializeTouchSupport() {
        const sliderContent = document.getElementById('sliderContent');
        if (!sliderContent) return;

        let startX = 0;
        let startTime = 0;

        sliderContent.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startTime = Date.now();
        });

        sliderContent.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endTime = Date.now();
            const diffX = startX - endX;
            const diffTime = endTime - startTime;

            // Swipe detection (minimum 50px movement in less than 300ms)
            if (Math.abs(diffX) > 50 && diffTime < 300) {
                if (diffX > 0) {
                    // Swipe left - next slide
                    this.nextSlide();
                } else {
                    // Swipe right - previous slide
                    this.previousSlide();
                }
            }
        });
    }

    nextSlide() {
        if (this.currentSlide < this.totalSlides - 1) {
            this.changeSlide(this.currentSlide + 1);
        }
    }

    previousSlide() {
        if (this.currentSlide > 0) {
            this.changeSlide(this.currentSlide - 1);
        }
    }

    changeSlide(newSlide) {
        // Hide current slide
        const currentSlideElement = document.getElementById(`slide-${this.currentSlide}`);
        if (currentSlideElement) {
            currentSlideElement.classList.remove('active');
        }

        // Show new slide
        this.currentSlide = newSlide;
        const newSlideElement = document.getElementById(`slide-${this.currentSlide}`);
        if (newSlideElement) {
            newSlideElement.classList.add('active');
        }

        this.updateSliderNavigation();
    }

    updateSliderNavigation() {
        const currentSlideSpan = document.getElementById('currentSlide');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        if (currentSlideSpan) {
            currentSlideSpan.textContent = this.currentSlide + 1;
        }

        if (prevBtn) {
            prevBtn.disabled = this.currentSlide === 0;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentSlide === this.totalSlides - 1;
        }
    }

    toggleCode(designIndex) {
        const toggle = document.querySelector(`#slide-${designIndex} .code-toggle`);
        const content = document.getElementById(`code-content-${designIndex}`);
        const icon = toggle.querySelector('.code-toggle-icon');

        if (content.classList.contains('expanded')) {
            content.classList.remove('expanded');
            toggle.classList.remove('expanded');
            icon.textContent = '▼';
        } else {
            content.classList.add('expanded');
            toggle.classList.add('expanded');
            icon.textContent = '▲';
        }
    }

    async initializeCanvas(designIndex, design) {
        const canvas = new fabric.Canvas(`canvas-${designIndex}`, {
            width: 800,
            height: 600,
            backgroundColor: design.backgroundColor
        });

        // Add design elements based on design type
        switch(design.type) {
            case 'modern':
                await this.createModernDesign(canvas, design);
                break;
            case 'classic':
                await this.createClassicDesign(canvas, design);
                break;
            case 'elegant':
                await this.createElegantDesign(canvas, design);
                break;
            case 'tech':
                await this.createTechDesign(canvas, design);
                break;
            case 'creative':
                await this.createCreativeDesign(canvas, design);
                break;
            default:
                await this.createModernDesign(canvas, design);
        }

        this.canvases[designIndex] = canvas;
        canvas.renderAll();
    }

    async createModernDesign(canvas, design) {
        // Add border
        const border = new fabric.Rect({
            left: 20,
            top: 20,
            width: 760,
            height: 560,
            fill: 'transparent',
            stroke: design.primaryColor,
            strokeWidth: 4,
            rx: 10,
            ry: 10
        });
        canvas.add(border);

        // Add decorative elements
        const decorativeRect1 = new fabric.Rect({
            left: 50,
            top: 50,
            width: 100,
            height: 6,
            fill: design.accentColor
        });
        canvas.add(decorativeRect1);

        const decorativeRect2 = new fabric.Rect({
            left: 650,
            top: 544,
            width: 100,
            height: 6,
            fill: design.accentColor
        });
        canvas.add(decorativeRect2);

        // Add title (use AI-enhanced title if available)
        const titleText = design.aiTitle || this.certificateData.categoryName;
        const title = new fabric.Text(titleText.toUpperCase(), {
            left: 400,
            top: 120,
            fontSize: 32,
            fontFamily: 'Arial Black',
            fill: design.primaryColor,
            textAlign: 'center',
            originX: 'center',
            fontWeight: 'bold'
        });
        canvas.add(title);

        // Add "Certificate of Achievement" text (use AI decorative text if available)
        const subtitleText = design.aiDecorative || 'CERTIFICATE OF ACHIEVEMENT';
        const subtitle = new fabric.Text(subtitleText.toUpperCase(), {
            left: 400,
            top: 180,
            fontSize: 18,
            fontFamily: 'Arial',
            fill: design.secondaryColor,
            textAlign: 'center',
            originX: 'center',
            letterSpacing: 3
        });
        canvas.add(subtitle);

        // Add recipient section
        const presentedTo = new fabric.Text('This is to certify that', {
            left: 400,
            top: 250,
            fontSize: 16,
            fontFamily: 'Arial',
            fill: design.textColor,
            textAlign: 'center',
            originX: 'center'
        });
        canvas.add(presentedTo);

        // Add recipient name
        const recipientName = new fabric.Text(this.certificateData.recipientName, {
            left: 400,
            top: 290,
            fontSize: 28,
            fontFamily: 'Arial Black',
            fill: design.primaryColor,
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            fontWeight: 'bold'
        });
        canvas.add(recipientName);

        // Add underline for name
        const nameLine = new fabric.Line([300, 340, 500, 340], {
            stroke: design.primaryColor,
            strokeWidth: 2
        });
        canvas.add(nameLine);

        // Add description (use AI-enhanced description if available)
        const descriptionText = design.aiDescription || `has successfully completed the ${this.certificateData.categoryName}`;
        const description = new fabric.Text(descriptionText, {
            left: 400,
            top: 380,
            fontSize: 16,
            fontFamily: 'Arial',
            fill: design.textColor,
            textAlign: 'center',
            originX: 'center',
            width: 600
        });
        canvas.add(description);

        // Add date and organization
        const dateText = new fabric.Text(`Date: ${this.formatDate(this.certificateData.dateIssued)}`, {
            left: 150,
            top: 480,
            fontSize: 14,
            fontFamily: 'Arial',
            fill: design.textColor
        });
        canvas.add(dateText);

        const orgText = new fabric.Text(this.certificateData.organizationName, {
            left: 550,
            top: 480,
            fontSize: 14,
            fontFamily: 'Arial',
            fill: design.textColor,
            textAlign: 'right',
            originX: 'right'
        });
        canvas.add(orgText);

        // Add signature lines
        const sigLine1 = new fabric.Line([120, 520, 220, 520], {
            stroke: design.textColor,
            strokeWidth: 1
        });
        canvas.add(sigLine1);

        const sigLine2 = new fabric.Line([580, 520, 680, 520], {
            stroke: design.textColor,
            strokeWidth: 1
        });
        canvas.add(sigLine2);

        const sigText1 = new fabric.Text('Director', {
            left: 170,
            top: 530,
            fontSize: 12,
            fontFamily: 'Arial',
            fill: design.textColor,
            textAlign: 'center',
            originX: 'center'
        });
        canvas.add(sigText1);

        const sigText2 = new fabric.Text('Instructor', {
            left: 630,
            top: 530,
            fontSize: 12,
            fontFamily: 'Arial',
            fill: design.textColor,
            textAlign: 'center',
            originX: 'center'
        });
        canvas.add(sigText2);
    }

    async createClassicDesign(canvas, design) {
        // Create classic ornate border
        const outerBorder = new fabric.Rect({
            left: 10,
            top: 10,
            width: 780,
            height: 580,
            fill: 'transparent',
            stroke: design.primaryColor,
            strokeWidth: 6,
        });
        canvas.add(outerBorder);

        const innerBorder = new fabric.Rect({
            left: 30,
            top: 30,
            width: 740,
            height: 540,
            fill: 'transparent',
            stroke: design.accentColor,
            strokeWidth: 2,
        });
        canvas.add(innerBorder);

        // Add decorative corners
        for(let i = 0; i < 4; i++) {
            const corner = new fabric.Circle({
                left: i % 2 === 0 ? 30 : 750,
                top: i < 2 ? 30 : 550,
                radius: 15,
                fill: design.accentColor,
                originX: 'center',
                originY: 'center'
            });
            canvas.add(corner);
        }

        // Add ornate title (use AI-enhanced title if available)
        const titleText = design.aiTitle || this.certificateData.categoryName;
        const title = new fabric.Text(titleText, {
            left: 400,
            top: 100,
            fontSize: 28,
            fontFamily: 'Times New Roman',
            fill: design.primaryColor,
            textAlign: 'center',
            originX: 'center',
            fontWeight: 'bold'
        });
        canvas.add(title);

        // Add decorative flourish
        const flourish = new fabric.Text('❦ ❦ ❦', {
            left: 400,
            top: 140,
            fontSize: 20,
            fill: design.accentColor,
            textAlign: 'center',
            originX: 'center'
        });
        canvas.add(flourish);

        // Certificate body text (use AI decorative text if available)
        const certTextContent = design.aiDecorative || 'CERTIFICATE OF EXCELLENCE';
        const certText = new fabric.Text(certTextContent.toUpperCase(), {
            left: 400,
            top: 180,
            fontSize: 16,
            fontFamily: 'Times New Roman',
            fill: design.secondaryColor,
            textAlign: 'center',
            originX: 'center',
            letterSpacing: 5
        });
        canvas.add(certText);

        // Presented to text
        const presentedText = new fabric.Text('This is hereby presented to', {
            left: 400,
            top: 230,
            fontSize: 14,
            fontFamily: 'Times New Roman',
            fill: design.textColor,
            textAlign: 'center',
            originX: 'center',
            fontStyle: 'italic'
        });
        canvas.add(presentedText);

        // Recipient name with decorative elements
        // Add recipient name with decorative elements
        const recipientName = new fabric.Text(this.certificateData.recipientName, {
            left: 400,
            top: 280,
            fontSize: 32,
            fontFamily: 'Times New Roman',
            fill: design.primaryColor,
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            fontWeight: 'bold'
        });
        canvas.add(recipientName);

        // Decorative underline
        const leftFlourish = new fabric.Text('〰', {
            left: 320,
            top: 320,
            fontSize: 20,
            fill: design.accentColor,
            originX: 'center'
        });
        canvas.add(leftFlourish);

        const rightFlourish = new fabric.Text('〰', {
            left: 480,
            top: 320,
            fontSize: 20,
            fill: design.accentColor,
            originX: 'center'
        });
        canvas.add(rightFlourish);

        // Achievement text (use AI-enhanced description if available)
        const achievementText = design.aiDescription || `For outstanding achievement in\n${this.certificateData.categoryName}`;
        const achievement = new fabric.Text(achievementText, {
            left: 400,
            top: 370,
            fontSize: 16,
            fontFamily: 'Times New Roman',
            fill: design.textColor,
            textAlign: 'center',
            originX: 'center'
        });
        canvas.add(achievement);

        // Date and seal
        const dateText = new fabric.Text(`Given this ${this.formatDate(this.certificateData.dateIssued)}`, {
            left: 400,
            top: 450,
            fontSize: 14,
            fontFamily: 'Times New Roman',
            fill: design.textColor,
            textAlign: 'center',
            originX: 'center',
            fontStyle: 'italic'
        });
        canvas.add(dateText);

        // Organization
        const orgName = new fabric.Text(this.certificateData.organizationName, {
            left: 400,
            top: 500,
            fontSize: 18,
            fontFamily: 'Times New Roman',
            fill: design.primaryColor,
            textAlign: 'center',
            originX: 'center',
            fontWeight: 'bold'
        });
        canvas.add(orgName);
    }

    async createElegantDesign(canvas, design) {
        // Add gradient background effect with rectangles
        const bgGradient = new fabric.Rect({
            left: 0,
            top: 0,
            width: 800,
            height: 200,
            fill: new fabric.Gradient({
                type: 'linear',
                coords: { x1: 0, y1: 0, x2: 0, y2: 200 },
                colorStops: [
                    { offset: 0, color: design.primaryColor },
                    { offset: 1, color: 'transparent' }
                ]
            })
        });
        canvas.add(bgGradient);

        // Elegant border
        const border = new fabric.Rect({
            left: 40,
            top: 40,
            width: 720,
            height: 520,
            fill: 'transparent',
            stroke: design.accentColor,
            strokeWidth: 2,
            strokeDashArray: [5, 5]
        });
        canvas.add(border);

        // Title with elegant styling (use AI-enhanced title if available)
        const titleText = design.aiTitle || this.certificateData.categoryName;
        const title = new fabric.Text(titleText, {
            left: 400,
            top: 80,
            fontSize: 26,
            fontFamily: 'Georgia',
            fill: '#ffffff',
            textAlign: 'center',
            originX: 'center',
            fontWeight: 'bold',
            shadow: 'rgba(0,0,0,0.3) 2px 2px 4px'
        });
        canvas.add(title);

        // Elegant divider
        const divider = new fabric.Line([300, 130, 500, 130], {
            stroke: design.accentColor,
            strokeWidth: 3,
            shadow: 'rgba(0,0,0,0.2) 1px 1px 2px'
        });
        canvas.add(divider);

        // Certificate type (use AI decorative text if available)
        const certTypeText = design.aiDecorative || 'Certificate of Achievement';
        const certType = new fabric.Text(certTypeText, {
            left: 400,
            top: 160,
            fontSize: 18,
            fontFamily: 'Georgia',
            fill: design.secondaryColor,
            textAlign: 'center',
            originX: 'center',
            fontStyle: 'italic'
        });
        canvas.add(certType);

        // Award text
        const awardText = new fabric.Text('is hereby awarded to', {
            left: 400,
            top: 220,
            fontSize: 16,
            fontFamily: 'Georgia',
            fill: design.textColor,
            textAlign: 'center',
            originX: 'center'
        });
        canvas.add(awardText);

        // Recipient name with elegant styling
        // Add recipient name with elegant styling
        const recipientName = new fabric.Text(this.certificateData.recipientName, {
            left: 400,
            top: 270,
            fontSize: 34,
            fontFamily: 'Georgia',
            fill: design.primaryColor,
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            fontStyle: 'italic',
            fontWeight: 'bold',
            shadow: 'rgba(0,0,0,0.1) 1px 1px 2px'
        });
        canvas.add(recipientName);

        // Recognition text (use AI-enhanced description if available)
        const recognitionText = design.aiDescription || `for exceptional performance and dedication\nin ${this.certificateData.categoryName}`;
        const recognition = new fabric.Text(recognitionText, {
            left: 400,
            top: 340,
            fontSize: 16,
            fontFamily: 'Georgia',
            fill: design.textColor,
            textAlign: 'center',
            originX: 'center',
            lineHeight: 1.5
        });
        canvas.add(recognition);

        // Date with elegant formatting
        const dateText = new fabric.Text(`Awarded on ${this.formatDate(this.certificateData.dateIssued)}`, {
            left: 400,
            top: 420,
            fontSize: 14,
            fontFamily: 'Georgia',
            fill: design.textColor,
            textAlign: 'center',
            originX: 'center',
            fontStyle: 'italic'
        });
        canvas.add(dateText);

        // Organization with elegant border
        const orgBg = new fabric.Rect({
            left: 300,
            top: 470,
            width: 200,
            height: 40,
            fill: 'transparent',
            stroke: design.accentColor,
            strokeWidth: 1,
            rx: 5,
            ry: 5
        });
        canvas.add(orgBg);

        const orgText = new fabric.Text(this.certificateData.organizationName, {
            left: 400,
            top: 490,
            fontSize: 16,
            fontFamily: 'Georgia',
            fill: design.primaryColor,
            textAlign: 'center',
            originX: 'center',
            fontWeight: 'bold'
        });
        canvas.add(orgText);
    }

    async createTechDesign(canvas, design) {
        // Tech-inspired background with geometric shapes
        const bgRect1 = new fabric.Rect({
            left: 0,
            top: 0,
            width: 800,
            height: 100,
            fill: design.primaryColor,
            opacity: 0.1
        });
        canvas.add(bgRect1);

        const bgRect2 = new fabric.Rect({
            left: 0,
            top: 500,
            width: 800,
            height: 100,
            fill: design.primaryColor,
            opacity: 0.1
        });
        canvas.add(bgRect2);

        // Modern geometric border
        const borderPath = new fabric.Rect({
            left: 30,
            top: 30,
            width: 740,
            height: 540,
            fill: 'transparent',
            stroke: design.accentColor,
            strokeWidth: 3,
            strokeDashArray: [10, 5]
        });
        canvas.add(borderPath);

        // Tech-style corner elements
        const corners = [
            {x: 30, y: 30}, {x: 770, y: 30}, 
            {x: 30, y: 570}, {x: 770, y: 570}
        ];

        corners.forEach(corner => {
            const cornerElement = new fabric.Rect({
                left: corner.x,
                top: corner.y,
                width: 20,
                height: 20,
                fill: design.accentColor,
                originX: 'center',
                originY: 'center',
                angle: 45
            });
            canvas.add(cornerElement);
        });

        // Modern title (use AI-enhanced title if available)
        const titleText = design.aiTitle || this.certificateData.categoryName;
        const title = new fabric.Text(titleText.toUpperCase(), {
            left: 400,
            top: 80,
            fontSize: 24,
            fontFamily: 'Arial Black',
            fill: design.primaryColor,
            textAlign: 'center',
            originX: 'center',
            letterSpacing: 2
        });
        canvas.add(title);

        // Tech divider lines
        const line1 = new fabric.Line([100, 120, 300, 120], {
            stroke: design.accentColor,
            strokeWidth: 2
        });
        canvas.add(line1);

        const line2 = new fabric.Line([500, 120, 700, 120], {
            stroke: design.accentColor,
            strokeWidth: 2
        });
        canvas.add(line2);

        // Certificate type with modern styling (use AI decorative text if available)
        const certTypeText = design.aiDecorative || 'DIGITAL CERTIFICATE';
        const certType = new fabric.Text(certTypeText.toUpperCase(), {
            left: 400,
            top: 150,
            fontSize: 16,
            fontFamily: 'Arial',
            fill: design.secondaryColor,
            textAlign: 'center',
            originX: 'center',
            letterSpacing: 3
        });
        canvas.add(certType);

        // Certified text
        const certifiedText = new fabric.Text('This certifies that', {
            left: 400,
            top: 200,
            fontSize: 14,
            fontFamily: 'Arial',
            fill: design.textColor,
            textAlign: 'center',
            originX: 'center'
        });
        canvas.add(certifiedText);

        // Recipient name with tech styling
        const nameContainer = new fabric.Rect({
            left: 250,
            top: 240,
            width: 300,
            height: 60,
            fill: 'transparent',
            stroke: design.primaryColor,
            strokeWidth: 2,
            rx: 5,
            ry: 5
        });
        canvas.add(nameContainer);

        const recipientName = new fabric.Text(this.certificateData.recipientName, {
            left: 400,
            top: 270,
            fontSize: 28,
            fontFamily: 'Arial Black',
            fill: design.primaryColor,
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            fontWeight: 'bold'
        });
        canvas.add(recipientName);

        // Achievement description (use AI-enhanced description if available)
        const achievementText = design.aiDescription || `Has successfully completed the requirements for\n${this.certificateData.categoryName}`;
        const achievement = new fabric.Text(achievementText, {
            left: 400,
            top: 340,
            fontSize: 16,
            fontFamily: 'Arial',
            fill: design.textColor,
            textAlign: 'center',
            originX: 'center',
            lineHeight: 1.4
        });
        canvas.add(achievement);

        // Tech-style info panel
        const infoPanel = new fabric.Rect({
            left: 60,
            top: 420,
            width: 680,
            height: 80,
            fill: design.accentColor,
            opacity: 0.1,
            rx: 10,
            ry: 10
        });
        canvas.add(infoPanel);

        // Date and organization in tech format
        const dateLabel = new fabric.Text('DATE:', {
            left: 100,
            top: 440,
            fontSize: 12,
            fontFamily: 'Arial Bold',
            fill: design.secondaryColor,
            fontWeight: 'bold'
        });
        canvas.add(dateLabel);

        const dateValue = new fabric.Text(this.formatDate(this.certificateData.dateIssued), {
            left: 100,
            top: 460,
            fontSize: 14,
            fontFamily: 'Arial',
            fill: design.textColor
        });
        canvas.add(dateValue);

        const orgLabel = new fabric.Text('ORGANIZATION:', {
            left: 400,
            top: 440,
            fontSize: 12,
            fontFamily: 'Arial Bold',
            fill: design.secondaryColor,
            fontWeight: 'bold'
        });
        canvas.add(orgLabel);

        const orgValue = new fabric.Text(this.certificateData.organizationName, {
            left: 400,
            top: 460,
            fontSize: 14,
            fontFamily: 'Arial',
            fill: design.textColor
        });
        canvas.add(orgValue);

        // QR code placeholder (represented as a square)
        const qrPlaceholder = new fabric.Rect({
            left: 650,
            top: 440,
            width: 50,
            height: 50,
            fill: 'transparent',
            stroke: design.textColor,
            strokeWidth: 1
        });
        canvas.add(qrPlaceholder);

        const qrText = new fabric.Text('QR', {
            left: 675,
            top: 465,
            fontSize: 12,
            fontFamily: 'Arial',
            fill: design.textColor,
            textAlign: 'center',
            originX: 'center'
        });
        canvas.add(qrText);
    }

    async createCreativeDesign(canvas, design) {
        // Creative background with artistic elements
        const bg1 = new fabric.Circle({
            left: 100,
            top: 100,
            radius: 80,
            fill: design.primaryColor,
            opacity: 0.1
        });
        canvas.add(bg1);

        const bg2 = new fabric.Circle({
            left: 600,
            top: 400,
            radius: 100,
            fill: design.accentColor,
            opacity: 0.1
        });
        canvas.add(bg2);

        // Creative wavy border
        const borderRect = new fabric.Rect({
            left: 40,
            top: 40,
            width: 720,
            height: 520,
            fill: 'transparent',
            stroke: design.primaryColor,
            strokeWidth: 4,
            rx: 20,
            ry: 20
        });
        canvas.add(borderRect);

        // Creative title with artistic font (use AI-enhanced title if available)
        const titleText = design.aiTitle || this.certificateData.categoryName;
        const title = new fabric.Text(titleText, {
            left: 400,
            top: 90,
            fontSize: 30,
            fontFamily: 'Impact',
            fill: design.primaryColor,
            textAlign: 'center',
            originX: 'center',
            fontWeight: 'bold',
            shadow: 'rgba(0,0,0,0.2) 3px 3px 6px'
        });
        canvas.add(title);

        // Creative decorative elements
        const star1 = new fabric.Text('★', {
            left: 300,
            top: 130,
            fontSize: 20,
            fill: design.accentColor
        });
        canvas.add(star1);

        const star2 = new fabric.Text('★', {
            left: 500,
            top: 130,
            fontSize: 20,
            fill: design.accentColor
        });
        canvas.add(star2);

        // Certificate of creativity text (use AI decorative text if available)
        const certTextContent = design.aiDecorative || 'Certificate of Creativity & Excellence';
        const certText = new fabric.Text(certTextContent, {
            left: 400,
            top: 160,
            fontSize: 18,
            fontFamily: 'Arial',
            fill: design.secondaryColor,
            textAlign: 'center',
            originX: 'center',
            fontStyle: 'italic'
        });
        canvas.add(certText);

        // Artistic divider
        const wave = new fabric.Text('〜〜〜〜〜〜〜〜〜〜', {
            left: 400,
            top: 190,
            fontSize: 16,
            fill: design.accentColor,
            textAlign: 'center',
            originX: 'center'
        });
        canvas.add(wave);

        // Presented to section
        const presentedText = new fabric.Text('Proudly presented to', {
            left: 400,
            top: 230,
            fontSize: 16,
            fontFamily: 'Arial',
            fill: design.textColor,
            textAlign: 'center',
            originX: 'center'
        });
        canvas.add(presentedText);

        // Creative name display
        const nameBox = new fabric.Rect({
            left: 200,
            top: 260,
            width: 400,
            height: 60,
            fill: design.accentColor,
            opacity: 0.2,
            rx: 30,
            ry: 30
        });
        canvas.add(nameBox);

        const recipientName = new fabric.Text(this.certificateData.recipientName, {
            left: 400,
            top: 290,
            fontSize: 32,
            fontFamily: 'Impact',
            fill: design.primaryColor,
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            fontWeight: 'bold'
        });
        canvas.add(recipientName);

        // Creative achievement text (use AI-enhanced description if available)
        const achievementDescription = design.aiDescription || `For outstanding creativity and innovation\nin ${this.certificateData.categoryName}`;
        const achievementText = new fabric.Text(achievementDescription, {
            left: 400,
            top: 360,
            fontSize: 16,
            fontFamily: 'Arial',
            fill: design.textColor,
            textAlign: 'center',
            originX: 'center',
            lineHeight: 1.5
        });
        canvas.add(achievementText);

        // Creative date display
        const dateContainer = new fabric.Ellipse({
            left: 200,
            top: 450,
            rx: 80,
            ry: 30,
            fill: design.primaryColor,
            opacity: 0.1
        });
        canvas.add(dateContainer);

        const dateText = new fabric.Text(this.formatDate(this.certificateData.dateIssued), {
            left: 200,
            top: 450,
            fontSize: 14,
            fontFamily: 'Arial',
            fill: design.textColor,
            textAlign: 'center',
            originX: 'center',
            originY: 'center'
        });
        canvas.add(dateText);

        // Creative organization display
        const orgContainer = new fabric.Ellipse({
            left: 600,
            top: 450,
            rx: 100,
            ry: 30,
            fill: design.accentColor,
            opacity: 0.1
        });
        canvas.add(orgContainer);

        const orgText = new fabric.Text(this.certificateData.organizationName, {
            left: 600,
            top: 450,
            fontSize: 16,
            fontFamily: 'Arial Bold',
            fill: design.primaryColor,
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            fontWeight: 'bold'
        });
        canvas.add(orgText);

        // Creative signature area
        const sigWave = new fabric.Text('〜〜〜〜〜', {
            left: 400,
            top: 520,
            fontSize: 14,
            fill: design.accentColor,
            textAlign: 'center',
            originX: 'center'
        });
        canvas.add(sigWave);

        const sigText = new fabric.Text('Authorized Signature', {
            left: 400,
            top: 540,
            fontSize: 12,
            fontFamily: 'Arial',
            fill: design.textColor,
            textAlign: 'center',
            originX: 'center',
            fontStyle: 'italic'
        });
        canvas.add(sigText);
    }

    displayCanvasCode(designIndex, design) {
        const codeContainer = document.getElementById(`code-${designIndex}`);
        const canvasCode = this.generateCanvasCode(designIndex, design);
        
        codeContainer.innerHTML = `<pre><code>${this.escapeHtml(canvasCode)}</code></pre>`;
    }

    generateCanvasCode(designIndex, design) {
        return `// Certificate Design ${designIndex + 1}: ${design.name}
// Canvas.js implementation using Fabric.js

// Initialize canvas
const canvas = new fabric.Canvas('certificate-canvas-${designIndex}', {
    width: 800,
    height: 600,
    backgroundColor: '${design.backgroundColor}'
});

// Certificate data
const certificateData = {
    categoryName: '${this.certificateData.categoryName}',
    recipientName: '${this.certificateData.recipientName}',
    organizationName: '${this.certificateData.organizationName}',
    dateIssued: '${this.certificateData.dateIssued}'
};

// Design colors
const colors = {
    primary: '${design.primaryColor}',
    secondary: '${design.secondaryColor}',
    accent: '${design.accentColor}',
    text: '${design.textColor}'
};

// Create ${design.type} certificate design
async function create${design.type.charAt(0).toUpperCase() + design.type.slice(1)}Certificate() {
    // Add border
    const border = new fabric.Rect({
        left: 40,
        top: 40,
        width: 720,
        height: 520,
        fill: 'transparent',
        stroke: colors.primary,
        strokeWidth: 3,
        ${design.type === 'modern' || design.type === 'elegant' ? 'rx: 10, ry: 10' : ''}
    });
    canvas.add(border);

    // Add title
    const title = new fabric.Text(certificateData.categoryName${design.type === 'modern' || design.type === 'tech' ? '.toUpperCase()' : ''}, {
        left: 400,
        top: ${design.type === 'classic' ? '100' : '90'},
        fontSize: ${design.type === 'creative' ? '30' : design.type === 'tech' ? '24' : '28'},
        fontFamily: '${design.type === 'classic' || design.type === 'elegant' ? 'Times New Roman' : design.type === 'creative' ? 'Impact' : design.type === 'tech' ? 'Arial Black' : 'Arial Black'}',
        fill: ${design.type === 'elegant' && designIndex === 2 ? "'#ffffff'" : 'colors.primary'},
        textAlign: 'center',
        originX: 'center',
        fontWeight: 'bold'${design.type === 'elegant' ? ',\n        shadow: "rgba(0,0,0,0.3) 2px 2px 4px"' : ''}${design.type === 'tech' ? ',\n        letterSpacing: 2' : ''}
    });
    canvas.add(title);

    // Add recipient name
    const recipientName = new fabric.Text(certificateData.recipientName, {
        left: 400,
        top: ${design.type === 'classic' ? '280' : design.type === 'creative' ? '290' : '270'},
        fontSize: ${design.type === 'creative' ? '32' : design.type === 'elegant' ? '34' : design.type === 'tech' ? '28' : '36'},
        fontFamily: '${design.type === 'classic' || design.type === 'elegant' ? 'Georgia' : design.type === 'creative' || design.type === 'tech' ? 'Arial Black' : 'Times New Roman'}',
        fill: colors.primary,
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        fontWeight: 'bold'${design.type === 'modern' || design.type === 'elegant' ? ',\n        fontStyle: "italic"' : ''}
    });
    canvas.add(recipientName);

    // Add description text
    const description = new fabric.Text(\`${design.type === 'tech' ? 'Has successfully completed the requirements for' : design.type === 'creative' ? 'For outstanding creativity and innovation in' : 'has successfully completed the'}\n\${certificateData.categoryName}\`, {
        left: 400,
        top: ${design.type === 'classic' ? '370' : design.type === 'elegant' ? '340' : design.type === 'tech' ? '340' : design.type === 'creative' ? '360' : '380'},
        fontSize: 16,
        fontFamily: '${design.type === 'classic' || design.type === 'elegant' ? 'Georgia' : 'Arial'}',
        fill: colors.text,
        textAlign: 'center',
        originX: 'center'${design.type === 'elegant' || design.type === 'creative' ? ',\n        lineHeight: 1.5' : ''}
    });
    canvas.add(description);

    // Add date and organization
    const dateText = new fabric.Text(\`Date: \${certificateData.dateIssued}\`, {
        left: ${design.type === 'tech' ? '100' : design.type === 'creative' ? '200' : '150'},
        top: ${design.type === 'classic' ? '450' : design.type === 'elegant' ? '420' : design.type === 'tech' ? '460' : design.type === 'creative' ? '450' : '480'},
        fontSize: 14,
        fontFamily: '${design.type === 'classic' || design.type === 'elegant' ? 'Georgia' : 'Arial'}',
        fill: colors.text${design.type === 'elegant' || design.type === 'creative' ? ',\n        textAlign: "center",\n        originX: "center",\n        originY: "center"' : ''}
    });
    canvas.add(dateText);

    const orgText = new fabric.Text(certificateData.organizationName, {
        left: ${design.type === 'tech' ? '400' : design.type === 'creative' ? '600' : design.type === 'elegant' ? '400' : '550'},
        top: ${design.type === 'classic' ? '500' : design.type === 'elegant' ? '490' : design.type === 'tech' ? '460' : design.type === 'creative' ? '450' : '480'},
        fontSize: ${design.type === 'classic' ? '18' : design.type === 'creative' ? '16' : design.type === 'elegant' ? '16' : '14'},
        fontFamily: '${design.type === 'classic' || design.type === 'elegant' ? 'Georgia' : 'Arial'}',
        fill: colors.primary,
        ${design.type === 'modern' ? 'textAlign: "right",\n        originX: "right"' : 'textAlign: "center",\n        originX: "center"'}${design.type === 'creative' || design.type === 'elegant' ? ',\n        originY: "center"' : ''}${design.type === 'classic' || design.type === 'creative' ? ',\n        fontWeight: "bold"' : ''}
    });
    canvas.add(orgText);

    // Render the canvas
    canvas.renderAll();
}

// Initialize the certificate
create${design.type.charAt(0).toUpperCase() + design.type.slice(1)}Certificate();

// Export functions
function downloadCertificateAsPNG() {
    const link = document.createElement('a');
    link.download = \`certificate-\${certificateData.categoryName.replace(/\\s+/g, '-').toLowerCase()}.png\`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function downloadCertificateAsPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('l', 'mm', 'a4'); // landscape orientation
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 10, 10, 277, 208);
    pdf.save(\`certificate-\${certificateData.categoryName.replace(/\\s+/g, '-').toLowerCase()}.pdf\`);
}`;
    }

    downloadCertificate(designIndex, format) {
        const canvas = this.canvases[designIndex];
        if (!canvas) return;

        if (format === 'png') {
            const link = document.createElement('a');
            link.download = `certificate-${this.certificateData.categoryName.replace(/\s+/g, '-').toLowerCase()}-design-${designIndex + 1}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } else if (format === 'pdf') {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('l', 'mm', 'a4'); // landscape orientation
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 10, 10, 277, 208);
            pdf.save(`certificate-${this.certificateData.categoryName.replace(/\s+/g, '-').toLowerCase()}-design-${designIndex + 1}.pdf`);
        }
    }

    copyCanvasCode(designIndex) {
        const codeBlock = document.querySelector(`#code-${designIndex} pre code`);
        if (codeBlock) {
            navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                // Show temporary success message
                const btn = event.target;
                const originalText = btn.textContent;
                btn.textContent = '✅ Copied!';
                btn.style.background = '#28a745';
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '#17a2b8';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy code: ', err);
                alert('Failed to copy code. Please select and copy manually.');
            });
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    getPredefinedDesigns() {
        return [
            {
                name: "Modern Professional",
                type: "modern",
                description: "Clean, contemporary design with geometric elements and professional typography. Features a minimalist border, bold title, and structured layout perfect for corporate achievements.",
                backgroundColor: "#ffffff",
                primaryColor: "#2c3e50",
                secondaryColor: "#34495e",
                accentColor: "#3498db",
                textColor: "#2c3e50"
            },
            {
                name: "Classic Elegance",
                type: "classic",
                description: "Traditional certificate design with ornate borders and classic typography. Includes decorative flourishes, elegant spacing, and timeless styling reminiscent of formal academic certificates.",
                backgroundColor: "#fefefe",
                primaryColor: "#8b4513",
                secondaryColor: "#a0522d",
                accentColor: "#daa520",
                textColor: "#654321"
            },
            {
                name: "Elegant Premium",
                type: "elegant",
                description: "Sophisticated design with gradient effects and refined typography. Features elegant borders, premium color scheme, and professional layout suitable for high-end certifications.",
                backgroundColor: "#f8f9fa",
                primaryColor: "#6c5ce7",
                secondaryColor: "#a29bfe",
                accentColor: "#fd79a8",
                textColor: "#2d3436"
            },
            {
                name: "Tech Innovation",
                type: "tech",
                description: "Modern tech-inspired design with geometric patterns and digital aesthetics. Includes QR code placeholder, structured info panels, and contemporary styling perfect for technology-related achievements.",
                backgroundColor: "#ffffff",
                primaryColor: "#0984e3",
                secondaryColor: "#74b9ff",
                accentColor: "#00b894",
                textColor: "#2d3436"
            },
            {
                name: "Creative Artistic",
                type: "creative",
                description: "Vibrant and creative design with artistic elements and playful typography. Features colorful accents, creative shapes, and dynamic layout ideal for creative fields and artistic achievements.",
                backgroundColor: "#ffffff",
                primaryColor: "#e17055",
                secondaryColor: "#fdcb6e",
                accentColor: "#6c5ce7",
                textColor: "#2d3436"
            }
        ];
    }
}

// Initialize the certificate generator when page loads
let generator;
document.addEventListener('DOMContentLoaded', function() {
    generator = new CertificateGenerator();
});

// Make generator available globally for button events
window.generator = generator;
