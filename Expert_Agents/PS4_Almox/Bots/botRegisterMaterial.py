import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.keys import Keys

def register_material_verified():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--window-size=1920,1080")
    
    URL = "https://industryview.doublex.ai/dashboard"
    LOGIN = "virginio.neto@doublex.com.br"
    PASS = "A11223300a@"

    item = {
        "codigo": "MAT-0001",
        "nome": "CURVA VERTICAL EXTERNA P/ LEITO",
        "especificacoes": "CURVA VERTICAL EXTERNA P/ LEITO, MEDIO, VIROLA EXTERNA 19MM, GF, CHAPA #16/18, R320, 90 G, 300 X 100MM",
        "quantidade": "6",
        "qtd_minima": "66",
        "ncm": "73089010",
        "cest": "1004100",
        "preco": "207.97",
        "lote": "L20251218",
        "classif_fiscal": "II - 73089010",
        "barras": "7897813895198"
    }

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    wait = WebDriverWait(driver, 45)

    try:
        driver.get(URL)
        print("[PM] Fazendo login...")
        wait.until(EC.presence_of_element_located((By.ID, "email"))).send_keys(LOGIN)
        driver.find_element(By.ID, "password").send_keys(PASS)
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        
        time.sleep(15)
        # Navegação direta para garantir o foco
        print("[Almoxarifado] Acessando módulo de Estoque...")
        driver.get("https://industryview.doublex.ai/stock")
        time.sleep(10)
        
        print("[Almoxarifado] Abrindo formulário '+Adicionar Produto'...")
        add_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//*[contains(text(), '+Adicionar Produto')]")))
        add_btn.click()
        time.sleep(5)

        # FUNÇÃO DE PREENCHIMENTO SEGURO
        def fill_safe(placeholder_text, label_text, value):
            try:
                # Tenta por placeholder primeiro, depois por label
                xpath = f"//input[@placeholder='{placeholder_text}'] | //label[contains(text(), '{label_text}')]/following-sibling::input | //textarea[@placeholder='{placeholder_text}']"
                el = driver.find_element(By.XPATH, xpath)
                el.clear()
                el.send_keys(str(value))
                print(f"  > '{label_text}' preenchido.")
            except:
                print(f"  > '{label_text}' ignorado (campo não encontrado).")

        print("[Almoxarifado] Preenchendo campos de texto...")
        fill_safe("Ex: MAT-0001", "Código", item["codigo"])
        fill_safe("Nome do produto", "Nome do Produto", item["nome"])
        fill_safe("Descreva as especificações", "Especificações", item["especificacoes"])
        fill_safe("00000000", "Código NCM", item["ncm"])
        fill_safe("0000000", "Código CEST", item["cest"])
        fill_safe("0.00", "Preço de Custo", item["preco"])
        
        # Campos por Label Direta
        fill_safe("", "Quantidade", item["quantidade"])
        fill_safe("", "Quantidade Mínima", item["qtd_minima"])
        fill_safe("", "Lote/Batelada", item["lote"])
        fill_safe("", "Classificação Fiscal", item["classif_fiscal"])
        fill_safe("", "Código de Barras", item["barras"])

        print("[Almoxarifado] Aguardando 5 segundos conforme instrução do usuário...")
        time.sleep(5)

        # SALVAR
        print("[Almoxarifado] Tentando Salvar Cadastro...")
        save_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Salvar') or contains(text(), 'Cadastrar') or @type='submit']")
        save_btn.click()
        
        time.sleep(5)
        driver.save_screenshot("Gestao_IA/07_resultado_cadastro_MAT0001.png")
        print("[PM] Processo finalizado. Verifique o resultado no IndustryView.")

    except Exception as e:
        print(f"[Erro] Falha no cadastro de verificação: {e}")
        driver.save_screenshot("Gestao_IA/erro_cadastro_verificado.png")
    finally:
        driver.quit()

if __name__ == "__main__":
    register_material_verified()
