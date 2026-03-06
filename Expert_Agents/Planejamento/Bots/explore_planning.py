import time
import json
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

def explore_planning_section():
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
        
        # Login
        wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='email']"))).send_keys(LOGIN)
        driver.find_element(By.XPATH, "//input[@type='password']").send_keys(PASS)
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        
        print("Login realizado. Navegando para Planejamento...")
        time.sleep(10)
        
        # Tenta acessar a seção de Planejamento
        try:
            planning_link = wait.until(EC.element_to_be_clickable((By.XPATH, "//a[contains(text(), 'Planejamento')]")))
            planning_link.click()
            time.sleep(5)
            print("Seção de Planejamento acessada.")
        except:
            print("Falha ao clicar no link de Planejamento, tentando via URL direta...")
            driver.get("https://industryview.doublex.ai/planning") # Suposição de URL baseada no menu
            time.sleep(5)

        # Captura a estrutura da tabela ou lista de tarefas
        # Buscamos por headers de tabela (th) ou labels de campos
        table_headers = driver.find_elements(By.TAG_NAME, "th")
        headers_found = [th.text.strip() for th in table_headers if th.text]
        
        # Se não houver th, busca por spans ou divs que pareçam colunas
        if not headers_found:
            potential_cols = driver.find_elements(By.XPATH, "//div[contains(@class, 'header')]//span")
            headers_found = [col.text.strip() for col in potential_cols if col.text]

        results = {
            "secao": "Planejamento",
            "campos_identificados": headers_found,
            "url_atual": driver.current_url,
            "texto_pagina": driver.find_element(By.TAG_NAME, "body").text[:1000]
        }
        
        with open("Gestao_IA/mapping_planning.json", "w", encoding="utf-8") as f:
            json.dump(results, f, indent=4, ensure_ascii=False)
            
        driver.save_screenshot("Gestao_IA/planning_view.png")
        print("Mapeamento de Planejamento concluído.")

    except Exception as e:
        print(f"Erro no mapeamento de Planejamento: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    explore_planning_section()
