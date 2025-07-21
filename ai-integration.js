// OpenAI API Integration Example
// Add this to your Certificate Generator for AI-enhanced content

class AIEnhancedCertificateGenerator extends CertificateGenerator {
    constructor() {
        super();
        this.openAIApiKey = null;
        this.aiEnabled = false;
    }

    setOpenAIKey(apiKey) {
        this.openAIApiKey = apiKey;
        this.aiEnabled = !!apiKey;
    }

    async enhanceDesignsWithAI() {
        if (!this.aiEnabled) {
            console.log('AI enhancement disabled - using predefined designs');
            return;
        }

        try {
            const enhancedContent = await this.generateAIContent();
            this.applyAIEnhancements(enhancedContent);
        } catch (error) {
            console.error('AI enhancement failed:', error);
            // Fall back to predefined designs
        }
    }

    async generateAIContent() {
        const prompt = this.buildPrompt();
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.openAIApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional certificate designer. Generate creative and appropriate content for certificates.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        return this.parseAIResponse(data.choices[0].message.content);
    }

    buildPrompt() {
        return `Generate certificate content for: "${this.certificateData.categoryName}"
        
        Please provide:
        1. A professional certificate title variation
        2. Achievement description (2-3 lines)
        3. Motivational closing statement
        4. Suggested color scheme (primary, secondary, accent colors in hex)
        5. Design style recommendation (modern, classic, elegant, tech, creative)
        
        Keep it professional and appropriate for: ${this.certificateData.categoryName}
        Recipient: ${this.certificateData.recipientName}
        Organization: ${this.certificateData.organizationName}
        
        Format as JSON with keys: title, description, closing, colors, style`;
    }

    parseAIResponse(content) {
        try {
            // Try to extract JSON from the response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            } else {
                // Parse as plain text and structure it
                return this.parseTextResponse(content);
            }
        } catch (error) {
            console.error('Failed to parse AI response:', error);
            return null;
        }
    }

    parseTextResponse(content) {
        const lines = content.split('\n').filter(line => line.trim());
        
        return {
            title: lines.find(line => line.toLowerCase().includes('title')) || 
                   `Advanced ${this.certificateData.categoryName}`,
            description: lines.filter(line => 
                line.toLowerCase().includes('achievement') || 
                line.toLowerCase().includes('completion')
            ).join(' ') || 
            `Has demonstrated exceptional skill and dedication in ${this.certificateData.categoryName}`,
            closing: lines.find(line => 
                line.toLowerCase().includes('congratulation') || 
                line.toLowerCase().includes('recognition')
            ) || 'Congratulations on this outstanding achievement!',
            colors: {
                primary: '#2c3e50',
                secondary: '#34495e',
                accent: '#3498db'
            },
            style: 'modern'
        };
    }

    applyAIEnhancements(aiContent) {
        if (!aiContent) return;

        // Update design templates with AI-generated content
        this.designs.forEach((design, index) => {
            if (aiContent.colors) {
                design.primaryColor = aiContent.colors.primary || design.primaryColor;
                design.secondaryColor = aiContent.colors.secondary || design.secondaryColor;
                design.accentColor = aiContent.colors.accent || design.accentColor;
            }

            if (aiContent.title) {
                design.aiTitle = aiContent.title;
            }

            if (aiContent.description) {
                design.aiDescription = aiContent.description;
            }

            if (aiContent.closing) {
                design.aiClosing = aiContent.closing;
            }

            // Update design description with AI insights
            if (aiContent.style && aiContent.style.toLowerCase() === design.type) {
                design.description += ` Enhanced with AI-generated content for ${this.certificateData.categoryName}.`;
            }
        });
    }

    // Override the text creation methods to use AI content when available
    createCertificateTitle(design) {
        return design.aiTitle || this.certificateData.categoryName;
    }

    createCertificateDescription(design) {
        return design.aiDescription || 
               `has successfully completed the ${this.certificateData.categoryName}`;
    }

    createCertificateClosing(design) {
        return design.aiClosing || 'Congratulations on this achievement!';
    }

    // Enhanced certificate generation with AI content
    async createModernDesign(canvas, design) {
        // Use AI-enhanced content if available
        const title = this.createCertificateTitle(design);
        const description = this.createCertificateDescription(design);
        
        // Add border (same as before)
        const border = new fabric.Rect({
            left: 20, top: 20, width: 760, height: 560,
            fill: 'transparent', stroke: design.primaryColor, strokeWidth: 4,
            rx: 10, ry: 10
        });
        canvas.add(border);

        // Add AI-enhanced title
        const titleText = new fabric.Text(title.toUpperCase(), {
            left: 400, top: 120, fontSize: 32,
            fontFamily: 'Arial Black', fill: design.primaryColor,
            textAlign: 'center', originX: 'center', fontWeight: 'bold'
        });
        canvas.add(titleText);

        // Add recipient name
        const recipientName = new fabric.Text(this.certificateData.recipientName, {
            left: 400, top: 290, fontSize: 36,
            fontFamily: 'Times New Roman', fill: design.primaryColor,
            textAlign: 'center', originX: 'center',
            fontStyle: 'italic', fontWeight: 'bold'
        });
        canvas.add(recipientName);

        // Add AI-enhanced description
        const descriptionText = new fabric.Text(description, {
            left: 400, top: 380, fontSize: 16,
            fontFamily: 'Arial', fill: design.textColor,
            textAlign: 'center', originX: 'center', width: 600
        });
        canvas.add(descriptionText);

        // Continue with standard elements...
        // (date, organization, signatures, etc.)
    }

    // Method to get AI-generated design suggestions
    async getDesignSuggestions() {
        if (!this.aiEnabled) return [];

        try {
            const prompt = `Suggest 3 creative certificate design ideas for: "${this.certificateData.categoryName}"
            
            For each design, provide:
            1. Design name
            2. Color palette (3-4 colors in hex)
            3. Typography suggestions
            4. Layout description
            5. Decorative elements
            
            Format as JSON array`;

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.openAIApiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 800,
                    temperature: 0.8
                })
            });

            const data = await response.json();
            return this.parseDesignSuggestions(data.choices[0].message.content);
        } catch (error) {
            console.error('Failed to get AI design suggestions:', error);
            return [];
        }
    }

    parseDesignSuggestions(content) {
        try {
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (error) {
            console.error('Failed to parse design suggestions:', error);
        }
        return [];
    }
}

// Usage example:
/*
const aiGenerator = new AIEnhancedCertificateGenerator();

// Set API key
aiGenerator.setOpenAIKey('your-openai-api-key-here');

// Generate certificates with AI enhancement
document.getElementById('generateBtn').addEventListener('click', async () => {
    await aiGenerator.generateCertificates();
});

// Get AI design suggestions
document.getElementById('getSuggestions').addEventListener('click', async () => {
    const suggestions = await aiGenerator.getDesignSuggestions();
    console.log('AI Design Suggestions:', suggestions);
});
*/

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIEnhancedCertificateGenerator;
} else if (typeof window !== 'undefined') {
    window.AIEnhancedCertificateGenerator = AIEnhancedCertificateGenerator;
}
