import matplotlib.pyplot as plt
import matplotlib.patches as patches

def draw_detailed_architecture():
    fig, ax = plt.subplots(figsize=(16, 10))
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 10)
    ax.axis('off')

    # Styles
    title_style = dict(ha='center', va='center', fontsize=12, fontweight='bold', color='#333333')
    sub_text_style = dict(ha='center', va='center', fontsize=9, color='#444444')
    
    # Helper to draw box
    def add_box(x, y, w, h, text, color, title=None, subtext=None, alpha=1.0):
        rect = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.1", 
                                      linewidth=1.5, edgecolor='#555555', facecolor=color, alpha=alpha)
        ax.add_patch(rect)
        if title:
            ax.text(x + w/2, y + h - 0.3, title, **title_style)
        if text:
            ax.text(x + w/2, y + h/2, text, ha='center', va='center', fontsize=10, fontweight='bold')
        if subtext:
             ax.text(x + w/2, y + 0.3, subtext, **sub_text_style)

    # ================= CLIENT TIER (Left) =================
    add_box(0.5, 0.5, 3.5, 9, "", '#F0F8FF', title="CLIENT TIER")
    
    # Customer App
    add_box(1, 5.6, 2.5, 3.5, "", '#E6E6FA', title="Customer App")
    ax.text(2.25, 8.45, "(React.js + Vite)", ha='center', fontsize=9, style='italic') 
    add_box(1.2, 7.4, 2.1, 0.7, "UI Components", '#FFFFFF')
    add_box(1.2, 6.5, 2.1, 0.7, "Redux / Context", '#FFFFFF')
    add_box(1.2, 5.6, 2.1, 0.7, "Axios / API Client", '#FFFFFF') 

    # Admin App
    add_box(1, 1, 2.5, 3.5, "", '#E6E6FA', title="Admin Panel")
    ax.text(2.25, 3.85, "(React + TypeScript)", ha='center', fontsize=9, style='italic')
    add_box(1.2, 2.9, 2.1, 0.7, "Dashboard UI", '#FFFFFF')
    add_box(1.2, 2.0, 2.1, 0.7, "Management Forms", '#FFFFFF') 
    add_box(1.2, 1.1, 2.1, 0.7, "Report Charts", '#FFFFFF')

    # ================= SERVER TIER (Center) =================
    # Main Container
    add_box(4.5, 0.5, 7, 9.2, "", '#FFFFF0', title="APPLICATION SERVER TIER") # Taller container (9->9.2)
    ax.text(8, 9.0, "(Node.js Runtime Environment)", ha='center', fontsize=9, style='italic') # Moved below title (Title is at ~9.4)

    # Express App
    add_box(5.0, 0.8, 6, 8.0, "", '#FFFACD', title="Express.js Application") 

    # Layers inside Express
    # 1. Routes/Middleware
    add_box(5.5, 6.4, 5, 1.8, "", '#FFD700', title="Middleware Layer", alpha=0.5) 
    add_box(5.7, 6.7, 2.2, 0.6, "Auth (JWT)", '#FFFFFF')
    add_box(8.1, 6.7, 2.2, 0.6, "Validation (Joi)", '#FFFFFF')
    add_box(5.7, 7.4, 2.2, 0.6, "CORS / Helmet", '#FFFFFF')
    add_box(8.1, 7.4, 2.2, 0.6, "Error Handling", '#FFFFFF')

    # 2. Controllers
    add_box(5.5, 3.7, 5, 2.5, "", '#ADD8E6', title="Controller Layer", alpha=0.5) # Height 2.4->2.5
    # Row 1 (Top)
    add_box(5.7, 4.0, 1.5, 0.7, "Auth", '#FFFFFF') 
    add_box(7.3, 4.0, 1.4, 0.7, "Product", '#FFFFFF')
    add_box(8.8, 4.0, 1.5, 0.7, "Order", '#FFFFFF')
    # Row 2 (Bottom)
    add_box(5.7, 4.9, 1.5, 0.7, "User", '#FFFFFF') # Lowered (was 5.1, container top is 6.2. 4.9+0.7=5.6. Clear of 5.9 title)
    add_box(7.3, 4.9, 1.4, 0.7, "Report", '#FFFFFF')
    add_box(8.8, 4.9, 1.5, 0.7, "Cart", '#FFFFFF')

    # 3. Services / Logic
    add_box(5.5, 1.2, 5, 2.3, "", '#98FB98', title="Service Layer", alpha=0.5) # Height 2.0->2.3
    # Inner logic
    add_box(5.7, 2.2, 4.6, 0.6, "Business Logic / Data Access", '#FFFFFF') # Lowered (was 2.5, now 2.2. Top=2.8. Container Title at 3.2. Clear.)
    add_box(5.7, 1.4, 2.2, 0.6, "Email Service", '#FFFFFF')
    add_box(8.1, 1.4, 2.2, 0.6, "Payment Service", '#FFFFFF')

    # ================= DATA & EXTERNAL (Right) =================
    add_box(12, 0.5, 3.5, 9.2, "", '#F5F5F5', title="DATA & EXTERNAL") # Match Server Height

    # MongoDB
    add_box(12.5, 5.7, 2.5, 3.5, "", '#90EE90', title="Database Server")
    ax.text(13.75, 8.55, "(MongoDB)", ha='center', fontsize=10, fontweight='bold')
    add_box(12.7, 7.5, 2.1, 0.7, "Users / Roles", '#FFFFFF')
    add_box(12.7, 6.6, 2.1, 0.7, "Products / Batches", '#FFFFFF')
    add_box(12.7, 5.7, 2.1, 0.7, "Invoices / Orders", '#FFFFFF')

    # External APIs
    add_box(12.5, 3.3, 2.5, 1.5, "VNPay Gateway", '#FFB6C1', title="Payment Provider")
    add_box(12.5, 1.3, 2.5, 1.5, "SMTP Server", '#D3D3D3', title="Email Provider", subtext="(Gmail/Outlook)")

    # ================= CONNECTIONS =================
    def draw_arrow(x1, y1, x2, y2, color='#333333'):
        ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle="->", lw=1.5, color=color))

    # Client -> Server
    draw_arrow(3.5, 7.3, 5.0, 7.3) # Customer -> API
    # Admin connect
    ax.annotate("", xy=(5.0, 3.0), xytext=(3.5, 2.5),
                arrowprops=dict(arrowstyle="->", lw=1.5, color='#333333'))
    
    ax.text(4.25, 7.4, "REST API", ha='center', fontsize=9)

    # Server Internal Flow
    draw_arrow(8, 6.4, 8, 6.2) # Middleware -> Controller
    draw_arrow(8, 3.7, 8, 3.5) # Controller -> Service

    # Server -> DB
    draw_arrow(10.5, 2.5, 12, 6.7) # Service -> DB 
    ax.text(11.3, 5.0, "Mongoose ODM", ha='center', rotation=50, fontsize=8)

    # Server -> External
    draw_arrow(10.5, 1.7, 12.5, 4.05) # Service -> VNPay
    draw_arrow(10.5, 1.7, 12.5, 2.05) # Service -> SMTP

    plt.tight_layout()
    plt.savefig('architecture_diagram_generated.png', dpi=300, bbox_inches='tight')
    print("Detailed diagram generated: architecture_diagram_generated.png")

if __name__ == "__main__":
    draw_detailed_architecture()
