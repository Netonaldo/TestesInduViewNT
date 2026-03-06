import time
import json
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

def fetch_current_inventory():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--window-size=1920,1080")
    
    URL = "https://industryview.doublex.ai/dashboard"
    LOGIN = "virginio.neto@doublex.com.br"
    PASS = "A11223300a@"
    PROJECT_NAME = "Montagem Processo Milho - EBER ATK_102_25"

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    wait = WebDriverWait(driver, 40)

    try:
        driver.get(URL)
        wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='email']"))).send_keys(LOGIN)
        driver.find_element(By.XPATH, "//input[@type='password']").send_keys(PASS)
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        
        time.sleep(12)
        # Seleciona projeto
        wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'projeto')] | //div[contains(text(), 'projeto')]"))).click()
        time.sleep(2)
        wait.until(EC.element_to_be_clickable((By.XPATH, f"//*[contains(text(), 'ATK_102_25') or contains(text(), 'Milho')]"))).click()
        time.sleep(10)
        
        # Vai para ESTOQUE
        print("[Almoxarifado] Acessando Estoque para verificar duplicatas...")
        wait.until(EC.element_to_be_clickable((By.XPATH, "//a[contains(., 'Estoque')]"))).click()
        time.sleep(10)
        
        # Captura a tabela de itens
        # Tentamos capturar todas as linhas (tr) da tabela de estoque
        rows = driver.find_elements(By.TAG_NAME, "tr")
        existing_items = []
        
        if len(rows) > 1: # Se tiver mais que o header
            headers = [th.text.strip() for th in rows[0].find_elements(By.TAG_NAME, "th")]
            for row in rows[1:]:
                cells = row.find_elements(By.TAG_NAME, "td")
                if cells:
                    item_data = {}
                    for i, cell in enumerate(cells):
                        header = headers[i] if i < len(headers) else f"col_{i}"
                        item_data[header] = cell.text.strip()
                    existing_items.append(item_data)
        
        print(f"[Almoxarifado] {len(existing_items)} itens encontrados no sistema.")
        
        results = {
            "total_count": len(existing_items),
            "items": existing_items,
            "page_text": driver.find_element(By.TAG_NAME, "body").text[:1000] # Para debug se estiver vazio
        }
        
        with open("Gestao_IA/current_inventory_data.json", "w", encoding="utf-8") as f:
            json.dump(results, f, indent=4, ensure_ascii=False)
            
        driver.save_screenshot("Gestao_IA/current_inventory_view.png")
        print("[Almoxarifado] Verificação de estoque concluída.")

    except Exception as e:
        print(f"[Erro Almoxarifado] Falha ao ler estoque: {e}")
        driver.save_screenshot("Gestao_IA/inventory_check_error.png")
    finally:
        driver.quit()

if __name__ == "__main__":
    fetch_current_inventory()
