const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    const rawBody = await req.text()
    if (!rawBody) throw new Error("No data received.")

    // Added postTelegram to the extracted payload
    const { mediaUrls, caption, postFacebook, postInstagram, postTelegram } = JSON.parse(rawBody)

    // Grab all our secrets
    const META_TOKEN = Deno.env.get('META_ACCESS_TOKEN')
    const PAGE_ID = Deno.env.get('FACEBOOK_PAGE_ID')
    const IG_ID = Deno.env.get('INSTAGRAM_ACCOUNT_ID')
    const TG_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
    const TG_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID')

    // Added telegram to the results object
    const results: { facebook: string | null; instagram: string | null; telegram: string | null; errors: string[] } = {
      facebook: null, instagram: null, telegram: null, errors: []
    }

    const isCarousel = mediaUrls && mediaUrls.length > 1;

    // --- 1. POST TO TELEGRAM ---
    if (postTelegram && TG_TOKEN && TG_CHAT_ID) {
      if (!isCarousel) {
        // Single Image
        const tgRes = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: TG_CHAT_ID, photo: mediaUrls[0], caption: caption })
        })
        const tgData = await tgRes.json()
        if (!tgData.ok) results.errors.push(`TG Error: ${tgData.description}`)
        else results.telegram = 'Success'
      } else {
        // Multiple Images (Media Group)
        // Telegram requires the caption to only be on the FIRST image of the group
        const mediaGroup = mediaUrls.map((url: string, index: number) => ({
          type: 'photo',
          media: url,
          caption: index === 0 ? caption : undefined
        }))

        const tgRes = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMediaGroup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: TG_CHAT_ID, media: mediaGroup })
        })
        const tgData = await tgRes.json()
        if (!tgData.ok) results.errors.push(`TG Carousel Error: ${tgData.description}`)
        else results.telegram = 'Success'
      }
    }

    // --- 2. POST TO FACEBOOK ---
    if (postFacebook && PAGE_ID && META_TOKEN) {
      if (!isCarousel) {
        const fbRes = await fetch(`https://graph.facebook.com/v19.0/${PAGE_ID}/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: mediaUrls[0], message: caption, access_token: META_TOKEN })
        })
        const fbData = await fbRes.json()
        if (fbData.error) results.errors.push(`FB Error: ${fbData.error.message}`)
        else results.facebook = 'Success'
      } else {
        const attachedMedia = [];
        for (const url of mediaUrls) {
          const res = await fetch(`https://graph.facebook.com/v19.0/${PAGE_ID}/photos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url, published: false, access_token: META_TOKEN })
          });
          const data = await res.json();
          if (data.id) attachedMedia.push({ media_fbid: data.id });
        }
        const fbRes = await fetch(`https://graph.facebook.com/v19.0/${PAGE_ID}/feed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: caption, attached_media: attachedMedia, access_token: META_TOKEN })
        })
        const fbData = await fbRes.json()
        if (fbData.error) results.errors.push(`FB Carousel Error: ${fbData.error.message}`)
        else results.facebook = 'Success'
      }
    }

    // --- 3. POST TO INSTAGRAM ---
    if (postInstagram && IG_ID && META_TOKEN) {
      if (!isCarousel) {
        const igContainerRes = await fetch(`https://graph.facebook.com/v19.0/${IG_ID}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_url: mediaUrls[0], caption: caption, access_token: META_TOKEN })
        })
        const igContainerData = await igContainerRes.json()
        if (igContainerData.error) {
          results.errors.push(`IG Container Error: ${igContainerData.error.message}`)
        } else {
          const igPublishRes = await fetch(`https://graph.facebook.com/v19.0/${IG_ID}/media_publish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ creation_id: igContainerData.id, access_token: META_TOKEN })
          })
          const igPublishData = await igPublishRes.json()
          if (igPublishData.error) results.errors.push(`IG Publish Error: ${igPublishData.error.message}`)
          else results.instagram = 'Success'
        }
      } else {
        const itemIds = [];
        for (const url of mediaUrls) {
          const res = await fetch(`https://graph.facebook.com/v19.0/${IG_ID}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url: url, is_carousel_item: true, access_token: META_TOKEN })
          });
          const data = await res.json();
          if (data.id) itemIds.push(data.id);
        }

        const containerRes = await fetch(`https://graph.facebook.com/v19.0/${IG_ID}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ media_type: 'CAROUSEL', children: itemIds.join(','), caption: caption, access_token: META_TOKEN })
        });
        const containerData = await containerRes.json();

        if (containerData.error) {
          results.errors.push(`IG Carousel Error: ${containerData.error.message}`)
        } else {
          const publishRes = await fetch(`https://graph.facebook.com/v19.0/${IG_ID}/media_publish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ creation_id: containerData.id, access_token: META_TOKEN })
          });
          const publishData = await publishRes.json();
          if (publishData.error) results.errors.push(`IG Carousel Publish Error: ${publishData.error.message}`)
          else results.instagram = 'Success'
        }
      }
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})