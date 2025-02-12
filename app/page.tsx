"use client"

import { useState } from "react"

type GlassDesign = {
  frameColor: string;
  lensColor: string;
}
import { ThemeProvider } from "next-themes"
import GlassCustomizer from "../components/GlassCustomizer"

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-gray-100 text-foreground">
        <main className="container mx-auto px-4 py-8">
          <GlassCustomizer
          />
        </main>
      </div>
    </ThemeProvider>
  )
}

