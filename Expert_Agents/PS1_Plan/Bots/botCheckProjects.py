import time
import json
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

def check_existing_projects():
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
        email_field = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='email']")))
        pass_field = driver.find_element(By.XPATH, "//input[@type='password']")
        email_field.send_keys(LOGIN)
        pass_field.send_keys(PASS)
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        
        print("Login realizado. Navegando para a lista de projetos...")
        time.sleep(8)
        
        # Tenta clicar no menu "Projetos" ou "Todos os projetos"
        try:
            projeto_link = wait.until(EC.element_to_be_clickable((By.XPATH, "//a[contains(text(), 'Projetos') or contains(text(), 'Todos os projetos')]")))
            projeto_link.click()
            time.sleep(5)
            print("Página de Projetos carregada.")
        except:
            print("Link de projetos não encontrado diretamente, tentando via URL direta se possível ou capturando tela.")

        # Captura o texto de todos os elementos que podem ser nomes de projetos
        project_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'ATK') or contains(text(), 'SADA') or contains(text(), 'EBER')]")
        
        found_projects = [el.text.strip() for el in project_elements if el.text]
        
        # Captura também a lista completa de cards ou linhas de tabela
        all_text = driver.find_element(By.TAG_NAME, "body").text
        
        results = {
            "projects_found_by_keywords": list(set(found_projects)),
            "full_page_text_summary": all_text[:2000], # Resumo do texto da página
            "current_url": driver.current_url
        }
        
        with open("Gestao_IA/current_projects_status.json", "w", encoding="utf-8") as f:
            json.dump(results, f, indent=4, ensure_ascii=False)
            
        driver.save_screenshot("Gestao_IA/projects_list_view.png")
        print("Verificação de projetos concluída.")

    except Exception as e:
        print(f"Erro ao verificar projetos: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    check_existing_projects()
