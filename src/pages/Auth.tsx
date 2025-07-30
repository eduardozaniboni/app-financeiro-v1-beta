import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import useAuth from "@/hooks/use-auth";
import { toast } from "react-hot-toast";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleAuth = () => {
    if (isLogin) {
      if (login(email)) {
        toast.success("Login bem-sucedido!");
        navigate("/");
      } else {
        toast.error("Email ou senha inválidos.");
      }
    } else {
      if (register(email, password)) {
        toast.success("Registro bem-sucedido! Faça o login.");
        setIsLogin(true);
      } else {
        toast.error("Este email já está em uso.");
      }
    }
  };

  const isRegisterButtonDisabled = !email || !password || !termsAccepted;

  return (
    <div className="flex h-screen">
      <div className="hidden lg:flex lg:w-1/2 bg-gray-100 items-center justify-center">
        <img src="/placeholder.svg" alt="Placeholder" className="w-1/2" />
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{isLogin ? "Login" : "Registrar"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {!isLogin && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(Boolean(checked))}
                  />
                  <Label htmlFor="terms">
                    Eu aceito os <a href="#" className="underline">Termos de Uso</a> e <a href="#" className="underline">Políticas de Privacidade</a>.
                  </Label>
                </div>
              )}
              <Button onClick={handleAuth} className="w-full" disabled={!isLogin && isRegisterButtonDisabled}>
                {isLogin ? "Entrar" : "Registrar"}
              </Button>
              <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="w-full">
                {isLogin ? "Não tem uma conta? Registre-se" : "Já tem uma conta? Faça login"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
