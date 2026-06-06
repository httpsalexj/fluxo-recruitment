import { Router } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { URLSearchParams } from 'url';
import { env, cookieOptions } from '../config/env.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signToken } from '../utils/tokens.js';
import { AppError } from '../utils/AppError.js';
import { createCsrfToken } from '../middleware/csrf.js';

export const authRouter = Router();

authRouter.get('/csrf', createCsrfToken);

authRouter.get(
  '/discord',
  asyncHandler(async (_req, res) => {
    const state = crypto.randomBytes(24).toString('hex');
    const params = new URLSearchParams({
      client_id: env.DISCORD_CLIENT_ID,
      redirect_uri: env.DISCORD_REDIRECT_URI,
      response_type: 'code',
      scope: env.DISCORD_SCOPES,
      state,
      prompt: 'consent'
    });

    res.cookie('oauth_state', state, { ...cookieOptions, maxAge: 10 * 60 * 1000 });
    res.redirect(`https://discord.com/oauth2/authorize?${params.toString()}`);
  })
);

authRouter.get(
  '/discord/callback',
  asyncHandler(async (req, res) => {
    const { code, state } = req.query;
    const savedState = req.cookies?.oauth_state;

    if (!code || !state || !savedState || state !== savedState) {
      throw new AppError(400, 'OAuth state inválido. Tente realizar login novamente.');
    }

    const tokenParams = new URLSearchParams({
      client_id: env.DISCORD_CLIENT_ID,
      client_secret: env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: String(code),
      redirect_uri: env.DISCORD_REDIRECT_URI
    });

    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', tokenParams, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const accessToken = tokenResponse.data.access_token;

    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const discord = userResponse.data as {
      id: string;
      username: string;
      global_name?: string | null;
      avatar?: string | null;
      email?: string | null;
    };

    const user = await User.findOneAndUpdate(
      { discordId: discord.id },
      {
        discordId: discord.id,
        username: discord.username,
        globalName: discord.global_name || '',
        avatar: discord.avatar || '',
        email: discord.email || '',
        lastLoginAt: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const jwt = signToken({
      type: 'candidate',
      id: user._id.toString(),
      discordId: user.discordId,
      email: user.email,
      username: user.username
    });

    res.clearCookie('oauth_state', cookieOptions);
    res.cookie('candidate_token', jwt, { ...cookieOptions, maxAge: 8 * 60 * 60 * 1000 });
    res.redirect(`${env.CLIENT_URL}/apply`);
  })
);

authRouter.get(
  '/me',
  asyncHandler(async (req, res) => {
    const token = req.cookies?.candidate_token;
    if (!token) return res.json({ user: null });

    try {
      const { verifyToken } = await import('../utils/tokens.js');
      const payload = verifyToken<{ type: string; id: string }>(token);
      if (payload.type !== 'candidate') return res.json({ user: null });
      const user = await User.findById(payload.id).lean();
      return res.json({ user });
    } catch {
      return res.json({ user: null });
    }
  })
);

authRouter.post('/logout', (_req, res) => {
  res.clearCookie('candidate_token', cookieOptions);
  res.json({ ok: true });
});
