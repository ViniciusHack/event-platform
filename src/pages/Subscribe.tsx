import classNames from "classnames";
import { FormEvent, useState } from "react";
import { toast } from "react-toastify";
import mockup from '../assets/code-mockup.png';
import { GitHubButton } from '../components/GitHubButton';
import { Logo } from "../components/Logo";
import { useCreateSubscriberMutation } from "../graphql/generated";
import { useAuth } from "../hooks/useAuth";

type SubscribeError = {
  field: string;
  message: string;
}

export function Subscribe() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<SubscribeError[]>([]);
  const { signIn } = useAuth();
  const [createSubscriber, { loading }] = useCreateSubscriberMutation()

  const emailError = error.find(err => err.field === "email");
  const nameError = error.find(err => err.field === "name");

  async function handleSubscribe(e: FormEvent) {
    e.preventDefault();
    setError([]);

    if(!name || !email) {
      if(!name) {
        setError(state => [...state, {field: "name", message:"Este campo é obrigatório"}]);
      }
      if(!email) {
        setError(state => [...state, { field:"email", message:"Este campo é obrigatório" }]);
      }
      return toast.error("Preencha todos os campos antes de prosseguir")
    }

    try {
    await createSubscriber({
      variables: {
        name,
        email
      }
    });

    signIn({ newUser: { name, email } });
    } catch (err: any) {
      const { errors } = err.networkError.result
      
      if(errors) {
        errors.forEach((error: {message: string}) => {
          if(error.message.includes("email") && error.message.includes("unique")){
            toast.error("Esse email já está cadastrado")
          }
        })
      }

    }
  }

  return (
    <div className="min-h-screen bg-blur bg-cover bg-no-repeat flex flex-col items-center">
      <div className="w-full max-w-[1100px] md:px-2 md:flex block items-center justify-between mt-20 mx-auto">
        <div className="lg:max-w-[640px] text-center px-6 grid place-items-center md:text-start md:block">
          <Logo />

          <h1 className="mt-8 text-[1.875rem] md:text-[2.5rem] leading-tight">
            Construa uma <strong className="text-blue-500">aplicação completa</strong>, do zero, com <strong className="text-blue-500">React</strong>
          </h1>
          <p className="mt-6 mb-8 md:mt-4 md:mb-0 text-gray-200 leading-relaxed">
          Em apenas uma semana você vai dominar na prática uma das tecnologias mais utilizadas e com alta demanda para acessar as melhores oportunidades do mercado.
          </p>
        </div>

        <div className="p-8 bg-gray-700 border border-gray-500 rounded">
          <strong className="text-[1,125rem] md:text-2xl mb-6 block">Inscreva-se gratuitamente</strong>

          <form onSubmit={handleSubscribe} className="flex flex-col gap-2 w-full">
            <input
              className={classNames("bg-gray-900 rounded px-5 h-14", {
                "border": nameError,
                "border-red-500": nameError,
              })}
              type="text" 
              placeholder="Seu nome completo"
              onChange={(e) => setName(e.target.value)} 
            />

            <input
              className={classNames("bg-gray-900 rounded px-5 h-14", {
                "border": emailError,
                "border-red-500": emailError,
              })}
              type="email"
              placeholder="Digite seu e-mail"
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <div className="flex items-center">
              <div className="bg-gray-500 h-[0.125rem] w-full"/>
              <p className="px-2">OU</p>
              <div className="bg-gray-500 h-[0.125rem] w-full"/>
            </div>

            <GitHubButton />

            <button 
              type="submit"
              disabled={loading}
              className="mt-4 bg-green-500 uppercase py-4 rounded font-bold text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              Garantir minha vaga
            </button>
          </form>
        </div>
      </div>

        <img src={mockup} className="mt-10" alt="" />
      </div>
  )
}