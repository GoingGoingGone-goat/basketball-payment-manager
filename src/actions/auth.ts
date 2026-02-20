'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const password = formData.get('password') as string

    // Simple check against the environment variable
    if (password === process.env.APP_PASSWORD) {
        cookies().set('auth-token', password, {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 30 // 30 days
        })
        redirect('/')
    }

    return { error: 'Incorrect password' }
}
