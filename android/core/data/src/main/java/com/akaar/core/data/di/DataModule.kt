package com.akaar.core.data.di

import com.akaar.core.common.AppDispatchers
import com.akaar.core.common.DefaultAppDispatchers
import com.akaar.core.data.repository.DemoSessionRepository
import com.akaar.core.data.repository.LocalProfileRepository
import com.akaar.core.domain.repository.ProfileRepository
import com.akaar.core.domain.repository.SessionRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DataModule {

    @Provides @Singleton
    fun provideDispatchers(): AppDispatchers = DefaultAppDispatchers()

    /**
     * Round one binds the demo implementation. Phase 9 swaps this one line for
     * the Supabase-backed repository; no screen changes.
     */
    @Provides @Singleton
    fun provideSessionRepository(impl: DemoSessionRepository): SessionRepository = impl

    @Provides @Singleton
    fun provideProfileRepository(impl: LocalProfileRepository): ProfileRepository = impl
}
