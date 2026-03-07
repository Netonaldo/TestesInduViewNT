import time
import json
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

def run_explorer_v2():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--window-size=1920,1080")
    
    URL = "https://industryview.doublex.ai/dashboard"
    LOGIN = "virginio.neto@doublex.com.br"
    PASS = "A11223300a@"

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    wait = WebDriverWait(driver, 25)

    try:
        driver.get(URL)
        print("Página de login carregada.")
        
        email_field = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='email']")))
        pass_field = driver.find_element(By.XPATH, "//input[@type='password']")
        email_field.send_keys(LOGIN)
        pass_field.send_keys(PASS)
        
        login_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        login_button.click()
        print("Login realizado. Aguardando Dashboard...")
        
        # Aguarda um elemento que indique que o dashboard carregou (ex: um container principal ou menu)
        time.sleep(10) # Tempo extra para SPAs
        
        # Captura todos os textos de links e botões visíveis
        elements = driver.find_elements(By.XPATH, "//a | //button | //span | //p")
        
        structure = {
            "all_text_elements": list(set([el.text.strip() for el in elements if el.text])),
            "current_url": driver.current_url,
            "page_title": driver.title
        }
        
        # Salva o resultado
        with open("Gestao_IA/industryview_detailed_structure.json", "w", encoding="utf-8") as f:
            json.dump(structure, f, indent=4, ensure_ascii=False)
            
        # Tira um print (salvo como base64 ou arquivo se possível, mas aqui vamos focar no texto)
        driver.save_screenshot("Gestao_IA/dashboard_view.png")
        
        print("Mapeamento detalhado concluído.")

    except Exception as e:
        print(f"Erro na V2: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    run_explorer_v2()
