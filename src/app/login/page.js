import AuthForm from "@/components/AuthForm";

export const metadata = {
  title: "Sign In — Rohan",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
